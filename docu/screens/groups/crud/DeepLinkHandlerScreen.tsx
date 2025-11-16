// src/screens/groups/crud/DeepLinkHandlerScreen.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import * as Linking from "expo-linking";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { path } from "../../../config";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";

export default function DeepLinkHandlerScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    let processed = false;

    const handleUrl = async (url: string) => {
      if (processed) return;
      processed = true;

      console.log("Deep link nhận được:", url); // ← LOG 1

      let groupId: number | null = null;

      if (url.includes("exp://")) {
        const match = url.match(/\/join\/(\d+)/);
        if (match) groupId = parseInt(match[1], 10);
      }

      if (!groupId) {
        console.log("Không tìm thấy groupId");
        navigation.replace("Home");
        return;
      }

      console.log("Group ID:", groupId); // ← LOG 2

      const token = await AsyncStorage.getItem("token");
      console.log("Token:", token ? "Có" : "Không có"); // ← LOG 3

      if (!token) {
        Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để tham gia nhóm", [
          { text: "OK", onPress: () => navigation.replace("LoginScreen") },
        ]);
        return;
      }

      try {
        const apiUrl = `${path}/groups/${groupId}/join-by-qr`;
        console.log("Gọi API:", apiUrl); // ← LOG 4

        const res = await axios.post(
          apiUrl,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("API thành công:", res.data); // ← LOG 5

        if (res.data.alreadyJoined) {
          Alert.alert("Thông báo", "Bạn đã là thành viên nhóm này rồi!");
          navigation.replace("Home");
          return;
        }

        const detail = await axios.get(`${path}/groups/${groupId}/detail`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Lấy tên nhóm:", detail.data.name); // ← LOG 6

        Alert.alert(
          "Thành công!",
          `Tham gia nhóm **${detail.data.name}** thành công!`,
          [
            {
              text: "Vào nhóm",
              onPress: () =>
                navigation.replace("GroupDetailScreen", { groupId }),
            },
          ],
          { cancelable: false }
        );
      } catch (err: any) {
        console.log("LỖI API:", err.message); // ← LOG 7
        console.log("Response:", err.response?.data);
        console.log("Status:", err.response?.status);

        const msg = err.response?.data?.message || "Không thể tham gia nhóm";
        Alert.alert("Lỗi", msg);
        navigation.replace("Home");
      }
    };

    // 1. Bắt khi app mở từ QR
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
      else setTimeout(() => navigation.replace("Home"), 1000);
    });

    // 2. Bắt khi app đang chạy
    const sub = Linking.addEventListener("url", (e) => handleUrl(e.url));
    return () => sub.remove();
  }, [navigation]);

  return (
    <View className="flex-1 bg-gray-100 justify-center items-center">
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
