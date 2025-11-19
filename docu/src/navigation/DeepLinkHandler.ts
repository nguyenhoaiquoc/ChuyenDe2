// src/navigation/deepLinkHandler.ts
import * as Linking from "expo-linking";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { path } from "../../config";

export const setupDeepLink = (navigationRef: any) => {
  let processed = false;

  const handleDeepLink = async (url: string) => {
    if (processed || !url.includes("/join/")) return;
    processed = true;

    console.log("DEEP LINK NHẬN ĐƯỢC:", url);

    const match = url.match(/\/join\/(\d+)/);
    if (!match) {
      navigationRef.current?.replace("Home");
      return;
    }

    const groupId = parseInt(match[1], 10);
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để tham gia nhóm");
      navigationRef.current?.replace("LoginScreen");
      return;
    }

    try {
      console.log("GỌI API JOIN:", `${path}/groups/${groupId}/join-by-qr`);
      const res = await axios.post(
        `${path}/groups/${groupId}/join-by-qr`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.alreadyJoined) {
        Alert.alert("Thông báo", "Bạn đã là thành viên nhóm này rồi!");
        navigationRef.current?.replace("Home");
        return;
      }

      const detail = await axios.get(`${path}/groups/${groupId}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await AsyncStorage.setItem(
        "JOIN_GROUP_SUCCESS",
        JSON.stringify({
          show: true,
          groupName: detail.data.name,
        })
      );

      navigationRef.current?.replace("Home");
    } catch (err: any) {
      console.log("LỖI JOIN:", err.message);
      // Alert.alert(
      //   "Lỗi",
      //   err.response?.data?.message || "Không thể tham gia nhóm"
      // );
      navigationRef.current?.replace("Home");
    }
  };

  // CHỜ NAVIGATION CONTAINER SẴN SÀNG
  const checkAndHandle = () => {
    if (navigationRef.current) {
      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink(url);
      });
    } else {
      setTimeout(checkAndHandle, 100); // thử lại sau 100ms
    }
  };

  // Bắt khi app đang chạy
  const subscription = Linking.addEventListener("url", (e) =>
    handleDeepLink(e.url)
  );

  // Bắt khi mở từ QR → CHỜ NAVIGATION SẴN SÀNG
  checkAndHandle();

  return () => subscription.remove();
};
