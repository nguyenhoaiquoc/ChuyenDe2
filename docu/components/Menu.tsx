import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
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
import { useEffect } from "react";

export default function Menu() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const unsub = navigation.addListener("state", () => {
      const route = navigation.getState().routes[navigation.getState().index];
      const name = route?.name ?? "Home";
      setActiveTab(name.toString().toLowerCase());
    });
    return unsub;
  }, [navigation]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
            className={`text-[10px] mt-1 font-medium ${activeTab === "home" ? "text-blue-500 font-semibold" : "text-[#aaa]"}`}
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
            color={activeTab === "ManagerGroupsScreen" ? "#4285F4" : "#aaa"}
          />
          <Text
            className={`text-[10px] mt-1 font-medium ${activeTab === "managepostsscreen" ? "text-blue-500 font-semibold" : "text-[#aaa]"}`}
          >
            Quản lý nhóm
          </Text>
        </TouchableOpacity>

        {/* Đăng tin */}
        <TouchableOpacity
          className="items-center flex-1 -mt-5"
          onPress={() => navigation.navigate("ChooseCategoryScreen")}
        >
          <View className="w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg">
            <Entypo name="plus" size={28} color="#fff" />
          </View>
          <Text className="text-[10px] text-blue-500 mt-1.5 font-semibold">
            Đăng tin
          </Text>
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity
          className="items-center flex-1"
          onPress={() => navigation.navigate("ChatListScreen")}
        >
          <Feather
            name="message-circle"
            size={22}
            color={activeTab === "chat" ? "#4285F4" : "#aaa"}
          />
          <Text
            className={`text-[10px] mt-1 font-medium ${activeTab === "chat" ? "text-blue-500 font-semibold" : "text-[#aaa]"}`}
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
            color={activeTab === "userscreen" ? "#4285F4" : "#aaa"} // 👈 dùng "userscreen"
          />
          <Text
            className={`text-[10px] mt-1 font-medium ${activeTab === "userscreen" ? "text-blue-500 font-semibold" : "text-[#aaa]"}`}
          >
            Tài khoản
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
