import { Text, View, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeAdminScreenNavigationProp } from "../../types";
import { disconnectSocket, getSocket } from "../../src/libs/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import "../../global.css";

type Props = {
  navigation: HomeAdminScreenNavigationProp;
};

export default function HomeAdminScreen({ navigation }: Props) {
  const handleLogout = async () => {
    try {
      const socket = getSocket();
      if (socket) {
        console.log("⚠️ [Admin] Gửi sự kiện logout");
        socket.emit("logout");
        disconnectSocket();
        console.log("✅ [Admin] Socket đã ngắt kết nối!");
      }
    } catch (err) {
      console.log("⚠️ [Admin] Lỗi khi gửi sự kiện logout:", err);
    }

    await AsyncStorage.multiRemove([
      "token",
      "userId",
      "userName",
      "userAvatar",
    ]);
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <StatusBar style="dark" />

      {/* Tiêu đề */}
      <View className="items-center mt-6 mb-8">
        <Text className="text-2xl font-extrabold text-indigo-700">
          👑 Trang Quản Trị
        </Text>
        <Text className="text-gray-500 mt-1">Xin chào, Admin!</Text>
      </View>

      {/* Menu chính */}
      <View className="space-y-4">
        <TouchableOpacity
          className="flex-row items-center justify-between bg-indigo-600 py-4 px-5 rounded-2xl shadow"
          onPress={() => navigation.navigate("ManageProductsScreen")}
        >
          <View className="flex-row items-center space-x-3">
            <Ionicons
              name="checkmark-done-circle-outline"
              size={22}
              color="#fff"
            />
            <Text className="text-white text-base font-semibold">
              Duyệt tin đăng sản phẩm
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Nút đăng xuất */}
      <TouchableOpacity
        onPress={handleLogout}
        className="mt-10 bg-red-500 py-4 rounded-2xl flex-row items-center justify-center shadow"
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text className="text-white text-base font-semibold ml-2">
          Đăng xuất
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
