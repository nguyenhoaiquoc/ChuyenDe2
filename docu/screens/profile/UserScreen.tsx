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
import { disconnectSocket, getSocket } from "../../src/libs/socket";

export default function UserScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
const [name, setName] = useState('');

useEffect(() => {
  AsyncStorage.getItem('userName').then(value => {
    if (value) setName(value);
  });
}, []);
  }, []); 


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View
          style={{ alignItems: "center", paddingTop: 32, paddingBottom: 24 }}
        >
          <Image
            source={require("../../assets/meo.jpg")}
            style={{ width: "100%", height: "100%", borderRadius: 48 }}
          />
        </View>
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
              title="Tài khoản của tôi"
              onPress={() => navigation.navigate("UserInforScreen")}
            />

            {roleId === "1" && (
              <UtilityItem
                icon="shield-checkmark-outline"
                title="Quản lý Admin"
                color="#3b82f6" // Màu xanh cho nổi bật
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
              isLast={true}
              color="red"
              onPress={async () => {
                try {
                  const socket = getSocket();
                  if (socket) {
                    console.log("⚠️ Gửi sự kiện logout");
                    socket.emit("logout"); // Gửi sự kiện logout đến backend
                    disconnectSocket(); // Ngắt kết nối socket hiện tại
                    console.log("✅ Socket đã ngắt kết nối!");
                  }
                } catch (err) {
                  console.log("⚠️ Lỗi khi gửi sự kiện logout:", err);
                }

                // ✨ 3. CẬP NHẬT LOGIC ĐĂNG XUẤT (THÊM "role_id") ✨
                await AsyncStorage.multiRemove([
                  "token",
                  "userId",
                  "userName",
                  "userAvatar",
                  "role_id", // 👈 PHẢI THÊM CÁI NÀY
                ]);
                navigation.reset({
                  index: 0,
                  routes: [{ name: "LoginScreen" }],
                });
              }}
            />
          </View>
        </View>
      </View>
      {/* --- Phần Tiện ích --- */}
      <View style={{ paddingHorizontal: 16 }}>
        {/* Tiêu đề nhỏ bên ngoài card */}
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
        {/* Card chứa các mục tiện ích */}
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
            isLast={true}
            onPress={() => navigation.navigate("FeedbackScreen")}
          />
          <UtilityItem
            icon="log-out-outline"
            title="Đăng xuất"
            isLast={true}
            color="red"
            onPress={async () => {
              // Xóa token đăng nhập
              await AsyncStorage.removeItem("token");
              // Nếu có lưu thông tin user khác cũng xóa luôn
              // await AsyncStorage.removeItem("userInfo");

              // Chuyển về màn hình đăng nhập
              navigation.reset({
                index: 0,
                routes: [{ name: "LoginScreen" }],
              });
            }}
          />

        </View>
      </View>
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
        <Text style={[{ marginLeft: 16, fontSize: 16, color: "#1f2937" }, textStyle]}>
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );
}
