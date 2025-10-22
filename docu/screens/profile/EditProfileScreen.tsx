import { View, Text, ScrollView, TextInput, Switch, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "UserInforScreen">;
};

export default function EditProfileScreen({navigation}: Props ) {
  const [allowContact, setAllowContact] = useState(true);

  const [name, setName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userName').then(value => {
      if (value) setName(value);
    });
  }, []);


  return (
    <ScrollView className="flex-1 bg-white px-4">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex flex-row items-center mt-10 mb-6">
        <MaterialIcons name="arrow-back" size={22} color="black" onPress={() => navigation.goBack()}/>
        <Text className="text-lg font-semibold ml-3">Cài đặt thông tin</Text>
      </View>

      {/* Section title */}
      <Text className="text-base font-bold mb-4">Thông tin cá nhân</Text>

      {/* Họ và tên */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Họ và tên *</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nhập họ và tên"
          defaultValue="05 Bảo 12A19"
        />
      </View>

      {/* Địa chỉ */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Địa chỉ của bạn</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nhập địa chỉ"
        />
      </View>

      {/* Số điện thoại */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Số điện thoại *</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          keyboardType="numeric"
          defaultValue="0903845125"
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
        Khi bật tính năng này, số điện thoại sẽ hiển thị trên tất cả tin đăng của bạn.
      </Text>

      {/* Giới thiệu */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Giới thiệu</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm h-20"
          placeholder="Viết vài dòng giới thiệu về gian hàng của bạn..."
          multiline
        />
        <Text className="text-xs text-gray-400 mt-1">Tối đa 60 từ</Text>
      </View>

      {/* Tên gợi nhớ */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Tên gợi nhớ</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Tên gợi nhớ của bạn"
        />
        <Text className="text-xs text-gray-400 mt-1">
          https://www.chotot.com/user/ten-goi-nho
        </Text>
        <Text className="text-xs text-gray-400">
          Tên gợi nhớ sau khi cập nhật sẽ không thể thay đổi trong vòng 60 ngày tới.
        </Text>
      </View>

      {/* CCCD */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">CCCD / CMND / Hộ chiếu</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nhập số giấy tờ"
        />
      </View>

      {/* Giới tính */}
      <View className="mb-4">
        <Text className="text-xs text-gray-500 mb-1">Giới tính</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nam / Nữ / Khác"
        />
      </View>

      {/* Ngày sinh */}
      <View className="mb-8">
        <Text className="text-xs text-gray-500 mb-1">Ngày, tháng, năm sinh</Text>
        <TextInput
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="dd/mm/yyyy"
        />
      </View>
      <View className="mt-6">
  <Text className="text-base font-semibold text-gray-800 mb-2">
    Thông tin xác thực
  </Text>

  <View className="flex-row justify-between items-center bg-gray-100 rounded-xl px-4 py-3 mb-3">
    <View className="flex-row items-center">
      <MaterialIcons name="email" size={22} color="#555" />
      <Text className="ml-2 text-gray-700">baohad987@gmail.com</Text>
    </View>

    <TouchableOpacity className="px-3 py-1 rounded-md bg-yellow-400">
      <Text className="text-sm font-semibold text-white">Thay đổi</Text>
    </TouchableOpacity>
  </View>
</View>


      {/* Nút Lưu */}
      <TouchableOpacity
        className="bg-yellow-400 rounded-md py-3 mb-10"
        activeOpacity={0.8}
      >
        <Text className="text-center font-semibold text-base text-gray-800">
          LƯU
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
