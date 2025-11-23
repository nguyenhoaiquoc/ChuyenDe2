import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import Menu from "../../components/Menu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import axios from "axios";
import { path } from "../../config";
import React from "react";
import { useChat } from "../../components/ChatContext";

export default function UserScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { socketRef, setUnreadCount } = useChat();  // 👈 LẤY TỪ ChatContext

  // GỘP USER VÀO 1 OBJECT
  const [user, setUser] = useState<{
    id: string;
    name: string;
    avatar: string | null;
    roleId: string | null;
  }>({
    id: "",
    name: "",
    avatar: null,
    roleId: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token");

        if (!userId || !token) {
          const localName = await AsyncStorage.getItem("userName");
          const localAvatar = await AsyncStorage.getItem("userAvatar");
          const localRoleId = await AsyncStorage.getItem("role_id");

          setUser({
            id: userId || "",
            name: localName || "",
            avatar: localAvatar || null,
            roleId: localRoleId || null,
          });
          return;
        }

        const res = await axios.get(`${path}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const nickname = res.data.nickname || res.data.name || "";
        const image = res.data.image || null;
        const apiRoleId =
          res.data.roleId != null ? String(res.data.roleId) : null;

        setUser({
          id: userId,
          name: nickname,
          avatar: image,
          roleId: apiRoleId,
        });

        await AsyncStorage.multiSet([
          ["userName", nickname],
          ["userAvatar", image || ""],
          ["role_id", apiRoleId || ""],
        ]);
      } catch (err) {
        console.log("Lỗi fetchUser:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View
          style={{ alignItems: "center", paddingTop: 32, paddingBottom: 24 }}
        >
          {/* Avatar */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("UserInforScreen", { userId: user.id })
            }
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "#d1d5db",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 4,
                borderColor: "white",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Image
                source={
                  user.avatar
                    ? {
                        uri: user.avatar.startsWith("http")
                          ? user.avatar
                          : `${path}${user.avatar}`,
                      }
                    : require("../../assets/default.png")
                }
                style={{ width: "100%", height: "100%", borderRadius: 48 }}
              />
            </View>
          </TouchableOpacity>

          {/* Tên */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 12,
              color: "#1f2937",
            }}
          >
            {user.name || "Đang tải..."}
          </Text>
        </View>

        {/* --- Tiện ích --- */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={{
              color: "#6b7280",
              fontWeight: "600",
              marginBottom: 8,
              marginLeft: 8,
            }}
          >
            Tiện ích
          </Text>

          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <UtilityItem
              icon="person-outline"
              title="Tài khoản của tôi"
              onPress={() =>
                navigation.navigate("UserInforScreen", { userId: user.id })
              }
            />

            {user.roleId === "1" && (
              <UtilityItem
                icon="shield-checkmark-outline"
                title="Quản lý Admin"
                color="#3b82f6"
                onPress={() => navigation.navigate("HomeAdminScreen")}
              />
            )}

            <UtilityItem
              icon="newspaper-outline"
              title="Quản lý tin"
              onPress={() => navigation.navigate("ManagePostsScreen")}
            />
            <UtilityItem
              icon="heart-outline"
              title="Tin đăng đã thích"
              onPress={() => navigation.navigate("SavedPostsScreen")}
            />
            <UtilityItem
              icon="trash-outline"
              title="Tìm kiếm đã lưu"
              onPress={() => navigation.navigate("SavedSearchScreen")}
            />
            <UtilityItem
              icon="time-outline"
              title="Lịch sử xem tin"
              onPress={() => navigation.navigate("SavedPosts")}
            />
            <UtilityItem
              icon="star-outline"
              title="Đánh giá từ tôi"
              onPress={() => navigation.navigate("FeedbackScreen")}
            />
           <UtilityItem
  icon="log-out-outline"
  title="Đăng xuất"
  isLast
  color="red"
  onPress={async () => {
    try {
      // 1. Ngắt đúng socket chat của ChatContext
      const socket = socketRef.current;
      if (socket) {
        socket.emit("logout");        // cho backend biết (nếu bạn có handle)
        socket.disconnect();          // cắt kết nối
        socketRef.current = null;     // rất quan trọng
      }

      // 2. Reset badge trên FE
      setUnreadCount(0);

      // 3. Xoá thông tin đăng nhập
      await AsyncStorage.multiRemove([
        "token",
        "userId",
        "userName",
        "userAvatar",
        "role_id",
      ]);

      // 4. Điều hướng về màn Login
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    } catch (err) {
      console.log("Lỗi logout:", err);
    }
  }}
/>

          </View>
        </View>
      </ScrollView>
      <Menu />
    </SafeAreaView>
  );
}

function UtilityItem({
  icon,
  title,
  isLast = false,
  onPress,
  textStyle,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  isLast?: boolean;
  onPress?: () => void;
  textStyle?: object;
  color?: string;
}) {
  const textColor = color || "#1f2937";
  const iconColor = color || "#6b7280";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#f3f4f6",
      }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <Text
          style={[
            { marginLeft: 16, fontSize: 16, color: textColor },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );
}
