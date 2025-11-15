import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { path } from "../../config";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "EditProfileScreen">;
};

// Helper chuyển ngày sang định dạng YYYY-MM-DD
const formatISODate = (date: Date) => date.toISOString().split("T")[0];

export default function EditProfileScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- State của form ---
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [nickname, setNickname] = useState("");
  const [cccd, setCccd] = useState("");
  const [gender, setGender] = useState("Khác");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [allowContact, setAllowContact] = useState(true);
// Hàm kiểm tra số điện thoại Việt Nam
const isValidPhone = (phone: string) => {
  // Bắt đầu bằng 0 hoặc +84, đủ 10 số (không tính +)
  const regex = /^(0|\+84)[0-9]{9}$/;
  return regex.test(phone);
};

  // --- Lấy dữ liệu người dùng ---
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setInitialLoading(true);
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token");

        if (!userId || !token) {
          Alert.alert("Lỗi", "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
          navigation.goBack();
          return;
        }

        const res = await axios.get(`${path}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(" User info API response:", res.data);

        // Tránh trường hợp backend bọc trong { data: {...} }
        const user = res.data?.data || res.data;

        if (!user) {
          Alert.alert("Lỗi", "Không lấy được thông tin người dùng.");
          return;
        }

        setName(user.fullName ?? "");
        setAddress(user.address_json?.full ?? user.address ?? "");
        setPhone(user.phone ?? "");
        setBio(user.bio ?? "");
        setNickname(user.nickname ?? "");
        setCccd(user.citizenId ?? "");
        setGender(
          user.gender === 1
            ? "Nam"
            : user.gender === 2
              ? "Nữ"
              : "Khác"
        );
        setDob(user.dob ? new Date(user.dob) : new Date());
        setAllowContact(user.allowContact ?? true);
      } catch (error: any) {
        console.error("❌ Lỗi tải user info:", error.response?.data || error.message);
        Alert.alert("Lỗi", "Không thể tải thông tin người dùng.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // --- Xử lý chọn ngày ---
  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  // --- Lưu thông tin ---
  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Lỗi", "Họ và tên không được để trống!");
     if (!isValidPhone(phone.trim())) return Alert.alert("Lỗi", "Số điện thoại không hợp lệ!"); // ✅

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      if (!userId || !token) throw new Error("Thiếu thông tin xác thực.");

      const genderMap: Record<string, number> = { Nam: 1, Nữ: 2, Khác: 3 };

      const dataToSend = {
        fullName: name,
        phone,
        address_json: { full: address },
        bio,
        nickname,
        citizenId: cccd,
        gender: genderMap[gender],
        dob: formatISODate(dob),
        allowContact,
      };

      console.log("📤 Sending update:", dataToSend);

      await axios.patch(`${path}/users/${userId}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Thành công", "Thông tin đã được cập nhật!");
      navigation.goBack();
    } catch (error: any) {
      console.error("❌ Lỗi khi lưu:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể lưu thông tin, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // --- Hiển thị khi đang load ---
  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#facc15" />
        <Text className="mt-2 text-gray-500">Đang tải thông tin người dùng...</Text>
      </View>
    );
  }

  // --- Giao diện chính ---
  return (
    <ScrollView className="flex-1 bg-white px-4" keyboardShouldPersistTaps="handled">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex flex-row items-center mt-10 mb-6">
        <MaterialIcons
          name="arrow-back"
          size={22}
          color="black"
          onPress={() => navigation.goBack()}
        />
        <Text className="text-lg font-semibold ml-3">Chỉnh sửa thông tin</Text>
      </View>

      {/* Nếu đang lưu */}
      {loading && (
        <View className="mb-4 flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#f97316" />
          <Text className="ml-2 text-gray-600">Đang lưu thay đổi...</Text>
        </View>
      )}

      {/* Form */}
      <Text className="text-base font-bold mb-4">Thông tin cá nhân</Text>

      {/* Họ tên */}
      <FormInput label="Họ và tên *" value={name} onChangeText={setName} placeholder="Nhập họ tên" />
      {/* Địa chỉ */}
      <FormInput label="Địa chỉ" value={address} onChangeText={setAddress} placeholder="Nhập địa chỉ" />
      {/* SĐT */}
      <FormInput
        label="Số điện thoại *"
        value={phone}
        onChangeText={(text) => {
          // Loại bỏ ký tự không phải số
          const cleaned = text.replace(/[^0-9+]/g, "");
          setPhone(cleaned);
        }}
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
      />

      {/* Cho phép liên lạc */}
      <View className="flex flex-row justify-between items-center mb-2">
        <Text className="text-sm text-gray-800">Cho phép người mua liên lạc</Text>
        <Switch
          value={allowContact}
          onValueChange={setAllowContact}
          trackColor={{ false: "#ccc", true: "#facc15" }}
          thumbColor={allowContact ? "#fff" : "#f4f3f4"}
        />
      </View>
      <Text className="text-xs text-gray-500 mb-5">
        Số điện thoại sẽ hiển thị trên tin đăng của bạn.
      </Text>

      {/* Giới thiệu */}
      <FormInput
        label="Giới thiệu"
        value={bio}
        onChangeText={setBio}
        placeholder="Giới thiệu bản thân..."
        multiline
      />

      {/* Tên gợi nhớ */}
      <FormInput label="Tên gợi nhớ" value={nickname} onChangeText={setNickname} placeholder="Nhập tên gợi nhớ" />

      {/* CCCD */}
      <FormInput
        label="CCCD / CMND"
        value={cccd}
        onChangeText={setCccd}
        placeholder="Nhập số giấy tờ"
        keyboardType="numeric"
      />

      {/* Giới tính */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Giới tính</Text>
        <View className="border border-gray-300 rounded-md">
          <Picker selectedValue={gender} onValueChange={(v) => setGender(v)}>
            <Picker.Item label="Nam" value="Nam" />
            <Picker.Item label="Nữ" value="Nữ" />
            <Picker.Item label="Khác" value="Khác" />
          </Picker>
        </View>
      </View>

      {/* Ngày sinh */}
      <View className="mb-8">
        <Text className="text-xs text-gray-500 mb-1">Ngày sinh</Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-md px-3 py-3"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-sm">{dob.toLocaleDateString("vi-VN")}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
      </View>

      {/* Nút lưu */}
      <TouchableOpacity
        className="bg-yellow-400 rounded-md py-3 mb-10"
        activeOpacity={0.8}
        onPress={handleSave}
        disabled={loading}
      >
        <Text className="text-center font-semibold text-base text-gray-800">
          LƯU THAY ĐỔI
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- Component con để gọn form ---
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "phone-pad";
  multiline?: boolean;
}) => (
  <View className="mb-4">
    <Text className="text-xs text-gray-500 mb-1">{label}</Text>
    <TextInput
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm ${multiline ? "h-20" : ""
        }`}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
    />
  </View>
);
