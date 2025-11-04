import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { parseStudentData, validateStudentData } from "./studentParser";

export default function VerifyStudentScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"scan" | "photo">("scan");

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = async (event: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const rawData = event.data;
      console.log("📦 Dữ liệu mã quét được (raw):", rawData);

      // Giải mã dữ liệu sinh viên từ QR
      const studentData = parseStudentData(rawData);
      console.log("✅ Dữ liệu sau khi parse:", studentData);

      // Kiểm tra dữ liệu có đầy đủ không
      const { isValid, missingFields } = validateStudentData(studentData);

      if (!isValid) {
        Alert.alert("Thiếu thông tin", `Vui lòng kiểm tra lại: ${missingFields.join(", ")}`);
        setScanned(false);
        return;
      }

      // Chỉ in ra log thay vì gửi server
      Alert.alert("🎓 Quét thành công!", `Tên: ${studentData.fullName}\nMSSV: ${studentData.studentCode}`);
      console.log("🎓 Dữ liệu sinh viên:", studentData);
    } catch (err) {
      console.error("❌ Lỗi khi xử lý mã QR:", err);
      Alert.alert("Lỗi", "Không thể đọc được dữ liệu mã QR.");
    } finally {
      // Cho phép quét lại sau 2 giây
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Thiếu quyền camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled && result.assets[0].uri) {
      console.log("📸 Ảnh chụp được:", result.assets[0].uri);
      Alert.alert("Ảnh chụp", "Đã chụp ảnh thẻ sinh viên (chưa gửi lên server).");
    }
  };

  if (!permission)
    return (
      <View style={styles.center}>
        <Text>Đang yêu cầu quyền camera...</Text>
      </View>
    );

  if (!permission.granted)
    return (
      <View style={styles.center}>
        <Text>Bạn cần cấp quyền camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      {mode === "scan" ? (
        <>
          <CameraView
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr", "code128", "ean13", "upc_a"] }}
            style={styles.camera}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 16 }} />
          ) : (
            <TouchableOpacity onPress={() => setMode("photo")} style={styles.switchBtn}>
              <Text style={styles.switchText}>Không có mã? Chụp ảnh thẻ</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.center}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 16 }} />
          ) : (
            <>
              <TouchableOpacity onPress={handlePickImage} style={styles.switchBtn}>
                <Text style={styles.switchText}>Chụp ảnh thẻ sinh viên</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode("scan")} style={[styles.switchBtn, { backgroundColor: "#555" }]}>
                <Text style={styles.switchText}>← Quay lại quét mã</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  camera: { width: "90%", height: 350, borderRadius: 12, overflow: "hidden" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: { marginTop: 16, backgroundColor: "#007AFF", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 14 },
  switchBtn: { marginTop: 16, padding: 10, backgroundColor: "#007AFF", borderRadius: 8 },
  switchText: { color: "#fff", fontSize: 14 },
});
