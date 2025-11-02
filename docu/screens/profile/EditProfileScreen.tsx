import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { path } from "../../config";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "UserInforScreen">;
  route: {
    params?: {
      onUpdate?: (updatedUser: any) => void;
    };
  };
};

export default function EditProfileScreen({ navigation, route }: Props) {
  const { onUpdate } = route.params || {};

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [nickname, setNickname] = useState("");
  const [cccd, setCccd] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [allowContact, setAllowContact] = useState(true);

  const [loading, setLoading] = useState(false);

  // Load dữ liệu từ AsyncStorage khi mở màn hình
  useEffect(() => {
    const loadData = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      const storedPhone = await AsyncStorage.getItem("userPhone");
      const storedAddress = await AsyncStorage.getItem("userAddress");
      const storedBio = await AsyncStorage.getItem("userBio");
      const storedNickname = await AsyncStorage.getItem("userNickname");
      const storedCccd = await AsyncStorage.getItem("userCccd");
      const storedGender = await AsyncStorage.getItem("userGender");
      const storedDob = await AsyncStorage.getItem("userDob");

      if (storedName) setName(storedName);
      if (storedPhone) setPhone(storedPhone);
      if (storedAddress) setAddress(storedAddress);
      if (storedBio) setBio(storedBio);
      if (storedNickname) setNickname(storedNickname);
      if (storedCccd) setCccd(storedCccd);
      if (storedGender) setGender(storedGender);
      if (storedDob) setDob(storedDob);
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Họ và tên không được để trống.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Số điện thoại không được để trống.");
      return;
    }

    setLoading(true);

    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");

    if (!userId || !token) {
      setLoading(false);
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin xác thực. Vui lòng đăng nhập lại."
      );
      return;
    }

    const dataToSend = {
      fullName: name,
      phone,
      address_json: { full: address },
      bio,
      nickname,
      cccd,
      gender: gender ? parseInt(gender, 10) : 0,
      dob,
    };

    try {
      // Gửi cập nhật lên server
      await axios.patch(`${path}/users/${userId}/info`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Cập nhật AsyncStorage
      await AsyncStorage.setItem("userName", name);
      await AsyncStorage.setItem("userPhone", phone);
      await AsyncStorage.setItem("userAddress", address);
      await AsyncStorage.setItem("userBio", bio);
      await AsyncStorage.setItem("userNickname", nickname);
      await AsyncStorage.setItem("userCccd", cccd);
      await AsyncStorage.setItem("userGender", gender);
      await AsyncStorage.setItem("userDob", dob);

      // Gọi callback để cập nhật ngay UserProfile
      onUpdate?.({
        fullName: name,
        phone,
        address_json: { full: address },
        address,
        bio,
        nickname,
        cccd,
        gender,
        dob,
      });

      setLoading(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân.");
      navigation.goBack();
    } catch (e: any) {
      console.error("Lỗi khi lưu thông tin:", e.response?.data || e.message);
      setLoading(false);
      Alert.alert("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-4">
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

      {loading && (
        <View className="mb-4 flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#f97316" />
          <Text className="ml-2 text-gray-600">Đang lưu...</Text>
        </View>
      )}

      {/* Thông tin cá nhân */}
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
          keyboardType="numeric"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Cho phép liên lạc */}
      <View className="flex flex-row justify-between items-center mb-2">
        <Text className="text-sm text-gray-800">
          Cho phép người mua liên lạc qua điện thoại
        </Text>
        <Switch
          value={allowContact}
          onValueChange={setAllowContact}
          trackColor={{ false: "#ccc", true: "#FFD700" }}
          thumbColor={allowContact ? "#fff" : "#f4f3f4"}
        />
      </View>
      <Text className="text-xs text-gray-500 mb-5">
        Khi bật tính năng này, số điện thoại sẽ hiển thị trên tất cả tin đăng
        của bạn.
      </Text>

      {/* Giới thiệu */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Giới thiệu</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm h-20"
          placeholder="Viết vài dòng giới thiệu về gian hàng của bạn..."
          multiline
          value={bio}
          onChangeText={setBio}
        />
        <Text className="text-xs text-gray-400 mt-1">Tối đa 60 từ</Text>
      </View>

      {/* Tên gợi nhớ */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Tên gợi nhớ</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Tên gợi nhớ của bạn"
          value={nickname}
          onChangeText={setNickname}
        />
      </View>

      {/* CCCD */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">
          CCCD / CMND / Hộ chiếu
        </Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nhập số giấy tờ"
          value={cccd}
          onChangeText={setCccd}
        />
      </View>

      {/* Giới tính */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Giới tính</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nam / Nữ / Khác"
          value={gender}
          onChangeText={setGender}
        />
      </View>

      {/* Ngày sinh */}
      <View className="mb-8">
        <Text className="text-xs text-gray-500 mb-1">Ngày, tháng, năm sinh</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="dd/mm/yyyy"
          value={dob}
          onChangeText={setDob}
        />
      </View>

      {/* Nút lưu */}
      <TouchableOpacity
        className="bg-yellow-400 rounded-md py-3 mb-10"
        activeOpacity={0.8}
        onPress={handleSave}
        disabled={loading}
      >
        <Text className="text-center font-semibold text-base text-gray-800">
          LƯU
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
