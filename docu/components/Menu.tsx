// Menu.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import {
  FontAwesome,
  Feather,
  Entypo,
  MaterialIcons,
} from "@expo/vector-icons";
import "../global.css";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useChat } from "./ChatContext";

export default function Menu() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Lấy unreadCount từ ChatContext
  const { unreadCount } = useChat();

  // Theo dõi thay đổi route để tô màu tab hiện tại
  useEffect(() => {
    const unsub = navigation.addListener("state", () => {
      const state = navigation.getState();
      const route = state.routes[state.index];
      const name = route?.name ?? "Home";
      setActiveTab(name.toString().toLowerCase());
    });
    return unsub;
  }, [navigation]);

  // Kiểm tra đăng nhập
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  return (
    <View className="absolute bottom-0 left-0 right-0">
      <View className="flex-row justify-around items-end bg-white pt-3 pb-4 border-t border-[#f0f0f0]">
        {/* Trang chủ */}
        <TouchableOpacity
          className="items-center flex-1"
          onPress={() => navigation.navigate("Home")}
        >
          <FontAwesome
            name="home"
            size={22}
            color={activeTab === "home" ? "#4285F4" : "#aaa"}
          />
          <Text
            className={`text-[10px] mt-1 font-medium ${
              activeTab === "home"
                ? "text-blue-500 font-semibold"
                : "text-[#aaa]"
            }`}
          >
            Trang chủ
          </Text>
        </TouchableOpacity>

        {/* Quản lý nhóm */}
        <TouchableOpacity
          className="items-center flex-1"
          onPress={() => navigation.navigate("ManagerGroupsScreen")}
        >
          <MaterialIcons
            name="assignment"
            size={22}
            color={activeTab === "managergroupsscreen" ? "#4285F4" : "#aaa"}
          />
          <Text
            className={`text-[10px] mt-1 font-medium ${
              activeTab === "managergroupsscreen"
                ? "text-blue-500 font-semibold"
                : "text-[#aaa]"
            }`}
          >
            Quản lý nhóm
          </Text>
        </TouchableOpacity>

        {/* Đăng tin */}
        <TouchableOpacity
          className="items-center flex-1 -mt-5"
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate("ChooseCategoryScreen");
            } else {
              navigation.navigate("LoginScreen");
            }
          }}
        >
          <View className="w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg">
            <Entypo name="plus" size={28} color="#fff" />
          </View>
          <Text className="text-[10px] text-blue-500 mt-1.5 font-semibold">
            Đăng tin
          </Text>
        </TouchableOpacity>

        {/* Chat + badge tổng unread */}
        <TouchableOpacity
          className="items-center flex-1"
          onPress={() => navigation.navigate("ChatListScreen")}
        >
          <View className="relative">
            <Feather
              name="message-circle"
              size={22}
              color={activeTab === "chatlistscreen" ? "#4285F4" : "#aaa"}
            />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-2 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            className={`text-[10px] mt-1 font-medium ${
              activeTab === "chatlistscreen"
                ? "text-blue-500 font-semibold"
                : "text-[#aaa]"
            }`}
          >
            Chat
          </Text>
        </TouchableOpacity>

        {/* Tài khoản */}
        <TouchableOpacity
          className="items-center flex-1"
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate("UserScreen");
            } else {
              navigation.navigate("LoginScreen");
            }
          }}
        >
          <FontAwesome
            name="user"
            size={22}
            color={activeTab === "userscreen" ? "#4285F4" : "#aaa"}
          />
          <Text
            className={`text-[10px] mt-1 font-medium ${
              activeTab === "userscreen"
                ? "text-blue-500 font-semibold"
                : "text-[#aaa]"
            }`}
          >
            Tài khoản
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
