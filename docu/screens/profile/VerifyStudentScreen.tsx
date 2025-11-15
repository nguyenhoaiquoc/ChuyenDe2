import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../config";

type ParsedCCCD = {
  fullName?: string;
  dob?: string;
  citizenId?: string;
  gender?: string;
  placeOfOrigin?: string;
  address?: string;
  raw?: string;
  [k: string]: any;
};

export default function VerifyCCCDScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedRaw, setScannedRaw] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedCCCD | null>(null);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [loading, setLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Request Camera Permission
  useEffect(() => {
    (async () => {
      if (!permission || !permission.granted) {
        await requestPermission();
      }
    })();
  }, [permission]);

  /** Parse raw CCCD/QR data */
  const parseRawData = (raw: string): ParsedCCCD => {
    const out: ParsedCCCD = {};

    // 1️⃣ Try JSON
    try {
      const j = JSON.parse(raw);
      if (typeof j === "object" && j !== null) {
        out.fullName = j.name || j.fullName || j.hoten;
        out.dob = j.birth || j.dateOfBirth || j.dob || j.ngaysinh;
        out.citizenId = j.id || j.cccd || j.citizenId || j.CCCD;
        out.gender = j.gender || j.sex;
        out.placeOfOrigin = j.placeOfOrigin || j.queQuan || j.quan;
        out.address = j.address || j.diachi;
        return out;
      }
    } catch (e) { }

    // 2️⃣ Key:value parsing
    const keyValRegex = /([^:;|=]+)[:=]\s*([^;|]+)/g;
    for (const match of raw.matchAll(keyValRegex)) {
      const key = match[1].trim().toLowerCase();
      const val = match[2].trim();
      if (/name|hoten/i.test(key)) out.fullName = val;
      else if (/dob|birth|ngaysinh/i.test(key)) out.dob = val;
      else if (/cccd|id|cmnd/i.test(key)) out.citizenId = val;
      else if (/gender|sex/i.test(key)) out.gender = val;
      else if (/place|que|origin/i.test(key)) out.placeOfOrigin = val;
      else if (/addr|diachi/i.test(key)) out.address = val;
      else out[key] = val;
    }
    if (Object.keys(out).length > 0) return out;

    // 3️⃣ Pipe-separated heuristic
    const parts = raw.split("|").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const maybeId = parts.find((p) => /^\d{9,15}$/.test(p));
      if (maybeId) {
        out.citizenId = maybeId;
        out.fullName = parts.find((p) => p !== maybeId && isNaN(Number(p))) || "";
        out.dob = parts.find((p) => p !== maybeId && p !== out.fullName) || "";
      } else {
        out.fullName = parts[0];
        out.citizenId = parts[1];
        out.dob = parts[2];
      }
      return out;
    }

    // fallback
    out.raw = raw;
    return out;
  };

  /** Handle QR/Barcode scanned */
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!data) return;
    setScannedRaw(data);
    const p = parseRawData(data);
    setParsed(p);

    Alert.alert("Đã quét", "Kiểm tra dữ liệu trước khi xác nhận.", [
      { text: "Quét lại", onPress: () => { setScannedRaw(null); setParsed(null); } },
      { text: "Xác nhận dữ liệu", style: "default" },
    ]);
  };

  /** Capture photo fallback */
  const handleCapturePhoto = async () => {
    try {
      const req = await ImagePicker.requestCameraPermissionsAsync();
      if (!req.granted) return Alert.alert("Thiếu quyền camera");
      const res = await ImagePicker.launchCameraAsync({ quality: 0.9, allowsEditing: false });
      if (res.canceled || !res.assets?.[0]?.uri) return;
      setPhotoUri(res.assets[0].uri);
      Alert.alert("Ảnh chụp", "Ảnh đã sẵn sàng để gửi cùng dữ liệu.");
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Chụp ảnh thất bại");
    }
  };

  /** Send parsed & optional photo to server */
  const handleSendToServer = async () => {
    if (!parsed && !photoUri) return Alert.alert("Chưa có dữ liệu");

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      console.log("Token:", token);
      console.log("UserId:", userId);

      if (!token || !userId) return Alert.alert("Cần đăng nhập");

      const form = new FormData();
      if (photoUri) form.append("citizenCard", { uri: photoUri, name: "cccd.jpg", type: "image/jpeg" } as any);
      if (parsed) form.append("parsed", JSON.stringify(parsed));

      const res = await axios.post(`${path}/users/${userId}/verify-cccd`, form, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      Alert.alert("Thành công", "Thông tin đã được gửi lên server.");
      navigation.goBack();
    } catch (err: any) {
      console.error("Send error", err.response?.data || err.message || err);
      Alert.alert("Lỗi", "Không thể gửi dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  /** UI - Permission check */
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12 }}>Đang yêu cầu quyền camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>Ứng dụng cần quyền camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Cấp quyền camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /** UI */
  return (
    <View style={styles.container}>
      {!scannedRaw && !photoUri ? (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.camera}
            facing={facing}
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr", "code128", "ean13", "upc_a"] }}
            ref={cameraRef}
          >
            <View style={styles.cameraTop}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFacing(f => f === "back" ? "front" : "back")} style={styles.smallBtn}>
                <MaterialIcons name="flip-camera-ios" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.scanArea}>
              <Text style={styles.hintText}>Giữ mã QR/CCCD trong khung để quét</Text>
            </View>

            <View style={styles.cameraBottom}>
              <TouchableOpacity onPress={handleCapturePhoto} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>Không có mã? Chụp ảnh</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.resultWrap}>
          <Text style={styles.title}>Kết quả trích xuất</Text>
          {parsed && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLine}><Text style={styles.label}>Họ tên:</Text> {parsed.fullName || "-"}</Text>
              <Text style={styles.infoLine}><Text style={styles.label}>Số CCCD:</Text> {parsed.citizenId || "-"}</Text>
              <Text style={styles.infoLine}><Text style={styles.label}>Ngày sinh:</Text> {parsed.dob || "-"}</Text>
              <Text style={styles.infoLine}><Text style={styles.label}>Giới tính:</Text> {parsed.gender || "-"}</Text>
              <Text style={styles.infoLine}><Text style={styles.label}>Quê quán:</Text> {parsed.placeOfOrigin || parsed.address || "-"}</Text>
              <Text style={styles.infoLine}><Text style={styles.label}>Raw:</Text> <Text style={{ fontSize: 12, color: '#444' }}>{scannedRaw}</Text></Text>
            </View>
          )}
          {photoUri && !parsed && (
            <Text style={{ marginTop: 8, textAlign: "center" }}>Ảnh chụp sẵn sàng: {photoUri}</Text>
          )}

          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <TouchableOpacity onPress={() => { setScannedRaw(null); setParsed(null); setPhotoUri(null); }} style={[styles.secondaryBtn, { marginRight: 8 }]}>
              <Text style={styles.secondaryText}>Quét lại</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSendToServer} style={styles.primaryBtn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Xác thực & Gửi</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

/* Styles (giữ nguyên của bạn) */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  cameraWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  camera: {
    width: Platform.OS === "web" ? 720 : "92%",
    height: 420,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  cameraTop: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between", zIndex: 10 },
  cameraBottom: { position: "absolute", bottom: 18, left: 12, right: 12, alignItems: "center", zIndex: 10 },
  smallBtn: { backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  smallBtnText: { color: "#fff", fontWeight: "600" },
  scanArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  hintText: { color: "#fff", fontSize: 16, backgroundColor: "rgba(0,0,0,0.35)", padding: 8, borderRadius: 8 },
  resultWrap: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  infoBox: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 10 },
  infoLine: { marginVertical: 6, color: "#111" },
  label: { fontWeight: "700", color: "#111" },
  primaryBtn: { backgroundColor: "#007AFF", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: { backgroundColor: "#f1f5f9", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: "center" },
  secondaryText: { color: "#1f2937", fontWeight: "700" },
});
