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
import { io } from "socket.io-client";

export default function UserScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState("");

  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token");
        if (!userId) return;

        const res = await axios.get(`${path}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fullName = res.data.fullName || res.data.name || "";
        const image = res.data.image || null;
        setName(fullName);
        setAvatar(image);
        await AsyncStorage.setItem("userName", fullName);
        if (image) await AsyncStorage.setItem("userAvatar", image);
      } catch {
        const localName = await AsyncStorage.getItem("userName");
        const localAvatar = await AsyncStorage.getItem("userAvatar");
        if (localName) setName(localName);
        if (localAvatar) setAvatar(localAvatar);
      }
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* --- Phần thông tin cá nhân --- */}
        <View
          style={{ alignItems: "center", paddingTop: 32, paddingBottom: 24 }}
        >
          {/* Avatar */}
          <TouchableOpacity
            onPress={() => navigation.navigate("UserInforScreen")}
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
                  avatar
                    ? {
                        uri: avatar.startsWith("http")
                          ? avatar
                          : `${path}${avatar}`,
                      }
                    : require("../../assets/meo.jpg")
                }
                style={{ width: "100%", height: "100%", borderRadius: 48 }}
              />
            </View>
          </TouchableOpacity>
          {/* Tên và thông tin theo dõi */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 12,
              color: "#1f2937",
            }}
          >
            {name || "Đang tải..."}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 4 }}>
            <Text style={{ color: "#6b7280", fontSize: 14, marginRight: 16 }}>
              Người theo dõi 1
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              Đang theo dõi 1
            </Text>
          </View>
        </View>

        {/* --- Phần Tiện ích --- */}
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
              title="Tài khoản của tôi  "
              onPress={() => navigation.navigate("ViewHistory")}
            />
            <UtilityItem
              icon="heart-outline"
              title="Tin đăng đã lưu "
              onPress={() => navigation.navigate("ViewHistory")}
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
  isLast={true}
  color="red"
  onPress={async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const socket = io(path, { auth: { token } });
        socket.emit("logout"); // 👈 báo server
        socket.disconnect();   // 👈 ngắt kết nối để trigger handleDisconnect
      }
    } catch (err) {
      console.log("⚠️ Socket logout error:", err);
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
  }}
/>

          </View>
        </View>
      </ScrollView>
      <Menu />
    </SafeAreaView>
  );
}
// Component UtilityItem - Đảm bảo không có raw strings
function UtilityItem({
  icon,
  title,
  isLast = false,
  onPress,
  textStyle, // thêm prop
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  isLast?: boolean;
  onPress?: () => void;
  textStyle?: object; // kiểu style cho text
  color?: string; // màu tùy chọn
}) {
  const textColor = color || "#1f2937"; // default text
  const iconColor = color || "#6b7280"; // default icon
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
            { marginLeft: 16, fontSize: 16, color: "#1f2937" },
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
