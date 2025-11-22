import { Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeAdminScreenNavigationProp } from "../../types";
import { disconnectSocket, getSocket } from "../../src/libs/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import "../../global.css";
import React from "react";

type Props = {
  navigation: HomeAdminScreenNavigationProp;
};

const AdminButton = ({
  icon,
  title,
  subtitle,
  onPress,
  color = "bg-indigo-600",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  color?: string;
}) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between ${color} py-4 px-5 rounded-2xl shadow-lg shadow-gray-400/30 mb-4`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center space-x-4">
        <Ionicons name={icon} size={26} color="#fff" />
        <View>
          <Text className="text-white text-base font-semibold">{title}</Text>
          <Text className="text-white text-xs opacity-80">{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#fff" />
    </TouchableOpacity>
  );
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
      "role_id",
    ]);

    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  const navigateToWIP = () => {
    Alert.alert("Chưa hoàn thiện", "Màn hình này đang được phát triển.");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-5">
      <StatusBar style="dark" />

      {/* Tiêu đề */}
      <View className="items-center mt-6 mb-8">
        <Text className="text-2xl font-extrabold text-indigo-700">
          Trang Quản Trị
        </Text>
        <Text className="text-gray-500 mt-1">Xin chào, Admin!</Text>
      </View>

      {/* Menu chính (dùng ScrollView để tránh tràn màn hình) */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-3">
          <AdminButton
            icon="home-outline"
            title="Trang home"
            subtitle="Trang user"
            color="bg-purple-600"
            onPress={() => navigation.navigate("Home")}
          />
          {/* 1. Dashboard */}
          <AdminButton
            icon="stats-chart-outline"
            title="Dashboard Thống Kê"
            subtitle="Số lượng người dùng, bài đăng, báo cáo"
            color="bg-purple-600"
            onPress={navigateToWIP} // Đổi thành navigation.navigate("AdminDashboardScreen")
          />

          {/* 2. Quản lý người dùng */}
          <AdminButton
            icon="people-outline"
            title="Quản lý Người Dùng"
            subtitle="Khóa/mở khóa tài khoản vi phạm"
            color="bg-red-600"
            onPress={() => navigation.navigate('AdminVerification')} 
          />

          {/* Quản lý danh mục */}
          <AdminButton
            icon="list-outline"
            title="Quản lý Danh mục"
            subtitle="Danh mục cha - con, thêm/sửa/xóa"
            color="bg-teal-600"
            onPress={() => navigation.navigate("ManageCategoriesScreen")}
          />

          {/* 3. Quản lý báo cáo */}
          <AdminButton
            icon="flag-outline"
            title="Quản lý Báo Cáo"
            subtitle="Xem xét và xử lý các báo cáo"
            color="bg-yellow-600"
            onPress={navigateToWIP} // Đổi thành navigation.navigate("ManageReportsScreen")
          />

          <Text className="text-gray-400 font-semibold uppercase pt-2 pb-1 px-1">
            Quản lý nội dung
          </Text>

          {/* 4. Duyệt tin Công Khai*/}
          <AdminButton
            icon="checkmark-done-circle-outline"
            title="Duyệt tin Công Khai"
            subtitle="Duyệt các tin đăng công khai"
            color="bg-green-600"
            onPress={() => navigation.navigate("ManageProductsScreen")}
          />

          {/* 5. Duyệt tin Nhóm */}
          <AdminButton
            icon="file-tray-stacked-outline"
            title="Duyệt tin trong Nhóm"
            subtitle="Duyệt các tin đăng trong nhóm"
            color="bg-blue-600"
            onPress={() => navigation.navigate("ManageGroupPostsScreen")}
          />
        </View>

        {/* Nút đăng xuất */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-10 bg-gray-700 py-4 rounded-2xl flex-row items-center justify-center shadow"
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text className="text-white text-base font-semibold ml-2">
            Đăng xuất
          </Text>
        </TouchableOpacity>

        {/* Đệm dưới cùng */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
