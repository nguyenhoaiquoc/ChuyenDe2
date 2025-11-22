import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  Modal,
  View,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "axios";
import AddressPicker from "../../components/AddressPicker";
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
  const [gender, setGender] = useState("");
  const [hometown, setHometown] = useState("");
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [allowContact, setAllowContact] = useState(true);
  const [showAddressPickerModal, setShowAddressPickerModal] = useState(false);
  const isCCCDVerified = Boolean(cccd && cccd.trim() !== "");

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
        setHometown(user.hometown ?? "");
        setNickname(user.nickname ?? "");
        setCccd(user.citizenId ?? "");
        setGender(
          user.gender
        );
        setDob(user.dob ?? "");
        setAllowContact(user.allowContact ?? true);
      } catch (error: any) {
        console.error(" Lỗi tải user info:", error.response?.data || error.message);
        Alert.alert("Lỗi", "Không thể tải thông tin người dùng.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Hàm xử lý sau khi AddressPicker chọn xong
  const handleAddressChange = (fullAddress: string) => {
    setAddress(fullAddress);
    setShowAddressPickerModal(false); // Ẩn modal sau khi chọn xong
  };
  // --- Lưu thông tin ---

  const handleSave = async () => {

    if (!isValidPhone(phone.trim())) return Alert.alert("Lỗi", "Số điện thoại không hợp lệ!"); // 

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      if (!userId || !token) throw new Error("Thiếu thông tin xác thực.");

      const genderMap: Record<string, number> = { Nam: 1, Nữ: 2, Khác: 3 };

      const dataToSend = {
        nickname,
        phone,
        address_json: { full: address },
        allowContact,
        address: address,
      };

      console.log(" Sending update:", dataToSend);

      await axios.patch(`${path}/users/${userId}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Thành công", "Thông tin đã được cập nhật!");
      navigation.goBack();
    } catch (error: any) {
      console.error(" Lỗi khi lưu:", error.response?.data || error.message);
      Alert.alert("Thông tin này đã được cập nhật !");
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

      {/* Tên gợi nhớ */}
      <FormInput label="Tên gợi nhớ" value={nickname} onChangeText={setNickname} placeholder="Nhập tên gợi nhớ" />
      {/* Địa chỉ - Dùng AddressPicker giống màn hình đăng tin */}
      <View className="mb-6">
        <Text className="text-xs text-gray-500 mb-2">Địa chỉ của bạn</Text>

        <TouchableOpacity
          className="flex flex-row justify-between items-center border border-gray-300 rounded-md px-3 py-3 bg-white"
          activeOpacity={0.7}
          onPress={() => setShowAddressPickerModal(true)}
        >
          <Text className={`text-sm ${address ? 'text-gray-800' : 'text-gray-400'}`}>
            {address || "Chạm để chọn địa chỉ"}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAddressPickerModal}
        animationType="slide"
        onRequestClose={() => setShowAddressPickerModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View className="flex flex-row justify-between items-center px-4 pb-4 border-b border-gray-200 mt-10">
            <TouchableOpacity onPress={() => setShowAddressPickerModal(false)}>
              <MaterialIcons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Chọn Địa chỉ</Text>
            <View style={{ width: 24 }} />
          </View>

          <AddressPicker onChange={handleAddressChange} />
        </View>
      </Modal>

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
      {/* Họ tên */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Họ và tên</Text>
        <View className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
          <Text className="text-sm text-gray-800">{name}</Text>
        </View>
        {isCCCDVerified && (
          <Text className="text-xs text-green-600 mt-1">Đã xác thực từ CCCD</Text>
        )}

      </View>
      {/* Quê quán */}
      {/* CCCD */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Quê quán</Text>
        <View className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
          <Text className="text-sm text-gray-800">{hometown}</Text>
        </View>
        {isCCCDVerified && (
          <Text className="text-xs text-green-600 mt-1">Đã xác thực từ CCCD</Text>
        )}

      </View>
      {/* CCCD */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">CCCD / CMND</Text>
        <View className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
          <Text className="text-sm text-gray-800">{cccd}</Text>
        </View>
        {isCCCDVerified && (
          <Text className="text-xs text-green-600 mt-1">Đã xác thực từ CCCD</Text>
        )}

      </View>


      {/* Giới tính */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Giới tính</Text>
        <View className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
          <Text className="text-sm text-gray-800">{gender}</Text>
        </View>
        {isCCCDVerified && (
          <Text className="text-xs text-green-600 mt-1">Đã xác thực từ CCCD</Text>
        )}

      </View>

      {/* Ngày sinh */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Ngày sinh</Text>
        <View className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
          <Text className="text-sm text-gray-800">
            {dob}
          </Text>
        </View>
        {isCCCDVerified && (
          <Text className="text-xs text-green-600 mt-1">Đã xác thực từ CCCD</Text>
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
