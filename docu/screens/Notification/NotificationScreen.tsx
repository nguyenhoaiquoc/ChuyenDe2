import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,

} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Menu from "../../components/Menu"; // Import Menu component của bạn
import "../../global.css"; // Import global css
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { SafeAreaView } from "react-native-safe-area-context";

// Định nghĩa props cho navigation
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "NotificationScreen">;
};

const filters = ["Tài khoản", "Giao dịch", "Tin đăng", "Sự kiện"];

export default function NotificationScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState("Hoạt động"); // Quản lý tab

  return (
    <SafeAreaView className="flex-1 bg-white mt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Thông báo</Text>
        <View className="w-6" />{/* Spacer */}
      </View>

      {/* Tab Navigator (Hoạt động / Tin tức) */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => setActiveTab("Hoạt động")}
          className={`flex-1 py-3 items-center ${
            activeTab === "Hoạt động"
              ? "border-b-2 border-black"
              : "border-b border-gray-200"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "Hoạt động" ? "text-black" : "text-gray-500"
            }`}
          >
            Hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Tin tức")}
          className={`flex-1 py-3 items-center ${
            activeTab === "Tin tức"
              ? "border-b-2 border-black"
              : "border-b border-gray-200"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "Tin tức" ? "text-black" : "text-gray-500"
            }`}
          >
            Tin tức
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips (Lọc, Tài khoản, Giao dịch...) */}
      <View className="px-4 pt-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full mr-2">
            <Ionicons name="filter" size={16} color="black" />
            <Text className="ml-1 text-sm">Lọc</Text>
          </TouchableOpacity>
          
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              className="bg-gray-100 px-3 py-1.5 rounded-full mr-2"
            >
              <Text className="text-sm">{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nội dung thông báo */}
      <View className="flex-1 items-center justify-center bg-gray-50/50">
        <Text className="text-gray-500">
          Hiện tại bạn chưa có thông báo nào
        </Text>
      </View>

      {/* Menu dưới cùng */}
      <Menu />
    </SafeAreaView>
  );
}