import React, { useState, useEffect } from "react"; // Thêm useEffect
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
  // Xóa route.params vì không dùng onUpdate nữa
};

// Helper chuyển đổi định dạng YYYY-MM-DD
const formatISODate = (date: Date) => {
  return date.toISOString().split("T")[0]; // Trả về "YYYY-MM-DD"
};

export default function EditProfileScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // State load dữ liệu ban đầu

  // --- Form state (Khởi tạo rỗng) ---
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [nickname, setNickname] = useState("");
  const [cccd, setCccd] = useState("");
  const [gender, setGender] = useState("Khác"); // Mặc định
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [allowContact, setAllowContact] = useState(true);

  // --- Tải dữ liệu khi mở màn hình ---
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setInitialLoading(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token");
        if (!userId || !token) {
          Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
          navigation.goBack();
          return;
        }

        const res = await axios.get(`${path}/users/${userId}/info`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;

        // Điền dữ liệu vào form
        if (user) {
          setName(user.fullName || "");
          setAddress(user.address_json?.full || "");
          setPhone(user.phone || "");
          setBio(user.bio || "");
          setNickname(user.nickname || "");
          setCccd(user.citizenId || ""); // Lấy từ citizenId
          setGender(user.gender || "Khác");
          setDob(user.dob ? new Date(user.dob) : new Date());
          // setAllowContact(user.allowContact); (Nếu có)
        }
      } catch (err) {
        console.log("Lỗi khi tải thông tin user:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCurrentUser();
  }, []); // Chỉ chạy 1 lần khi mở

  // --- Hàm xử lý DatePicker ---
  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  // --- Hàm Lưu thông tin (Đã sửa lỗi 404 & 500) ---
  const handleSave = async () => {
    if (!name.trim()) {
      return Alert.alert("Lỗi", "Họ và tên không được để trống.");
    }
    if (!phone.trim()) {
      return Alert.alert("Lỗi", "Số điện thoại không được để trống.");
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      if (!userId || !token) throw new Error("Không tìm thấy thông tin đăng nhập");
      const genderMap: { [key: string]: number } = {
        "Nam": 1,
        "Nữ": 2,
        "Khác": 3,
      };
      const dataToSend = {
        fullName: name,
        phone,
        address_json: { full: address },
        bio,
        nickname,
        citizenId: cccd, // Sửa: Gửi citizenId
        gender: genderMap[gender],
        dob: formatISODate(dob),
        // allowContact,
      };

     
      await axios.patch(`${path}/users/${userId}/info`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật!");

      // ✅ CHỈ CẦN QUAY LẠI
      navigation.goBack();
      // (UserInforScreen sẽ tự động fetch lại)

    } catch (err: any) {
      console.error("Lỗi khi lưu thông tin:", err.response?.data || err.message);
      setLoading(false);
      Alert.alert("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại.");
    }
  };

  // --- RENDER ---
  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#facc15" />
        <Text className="mt-2 text-gray-500">Đang tải dữ liệu...</Text>
      </View>
    );
  }

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
        <Text className="text-lg font-semibold ml-3">Cài đặt thông tin</Text>
      </View>

      {/* Loading (khi lưu) */}
      {loading && (
        <View className="mb-4 flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#f97316" />
          <Text className="ml-2 text-gray-600">Đang lưu...</Text>
        </View>
      )}

      <Text className="text-base font-bold mb-4">Thông tin cá nhân</Text>

      {/* Họ và tên */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Họ và tên *</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nhập họ và tên"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Địa chỉ */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Địa chỉ</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nhập địa chỉ"
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* Số điện thoại */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Số điện thoại *</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Cho phép liên lạc */}
      <View className="flex flex-row justify-between items-center mb-2">
        <Text className="text-sm text-gray-800">
          Cho phép người mua liên lạc
        </Text>
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
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Giới thiệu</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm h-20"
          placeholder="Viết vài dòng giới thiệu..."
          multiline
          value={bio}
          onChangeText={setBio}
          textAlignVertical="top"
        />
      </View>

      {/* Tên gợi nhớ */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Tên gợi nhớ</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Tên gợi nhớ"
          value={nickname}
          onChangeText={setNickname}
        />
      </View>

      {/* CCCD (Dùng citizenId) */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">CCCD / CMND</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nhập số giấy tờ"
          keyboardType="numeric"
          value={cccd}
          onChangeText={setCccd}
        />
      </View>

      {/* Giới tính (Dùng Picker) */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Giới tính</Text>
        <View className="border border-gray-300 rounded-md">
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
          >
            <Picker.Item label="Nam" value="Nam" />
            <Picker.Item label="Nữ" value="Nữ" />
            <Picker.Item label="Khác" value="Khác" />
          </Picker>
        </View>
      </View>

      {/* Ngày sinh (Dùng DateTimePicker) */}
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