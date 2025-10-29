import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5 } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import "../../global.css";
import axios from "axios";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ChatListScreen">;
};

export default function ChatListScreen({ navigation }: Props) {
  const [chatList, setChatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /** 🧩 Hàm mở phòng chat (có token + user) */
  const handleOpenRoom = async (room: any) => {
    try {
      const tokenValue = await AsyncStorage.getItem("token");
      const currentUserId = await AsyncStorage.getItem("userId");
      const currentUserName = await AsyncStorage.getItem("userName");

      if (!tokenValue || !currentUserId) {
        Alert.alert("Thông báo", "Vui lòng đăng nhập lại để tiếp tục.");
        return;
      }

      console.log("🚀 Điều hướng ChatRoom với token:", tokenValue);
      console.log("🧠 UserId hiện tại:", currentUserId);

      navigation.navigate("ChatRoomScreen", {
        roomId: room.room_id,
        product: room.product,
        otherUserId: room.partner?.id,
        otherUserName: room.partner?.name,
        currentUserId: Number(currentUserId),
        currentUserName: currentUserName || "Tôi",
        token: tokenValue,
      });
    } catch (error) {
      console.error("❌ Lỗi mở phòng chat:", error);
      Alert.alert("Lỗi", "Không thể mở phòng chat. Vui lòng thử lại!");
    }
  };

  /** 📨 Lấy danh sách chat */
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.log("⚠️ Không có token, vui lòng đăng nhập lại");
          return;
        }

        const res = await axios.get(`${path}/chat/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("💬 Chat list nhận được:", res.data.data?.length || 0);
        setChatList(res.data.data || []);
      } catch (err: any) {
        console.log(
          "❌ Lỗi tải danh sách chat:",
          err.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <View className="flex-1 bg-[#f5f6fa]">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="flex flex-row justify-between mt-14 items-center px-5">
        <Text className="text-2xl font-bold">Chat</Text>
        <View className="flex flex-row gap-10">
          <FontAwesome5
            name="search"
            size={20}
            color="gray"
            onPress={() => navigation.navigate("SearchScreen")}
          />
          <FontAwesome5 name="bars" size={20} color="gray" />
        </View>
      </View>

      <View className="w-full h-[1px] bg-gray-300 mt-10" />

      <View className="flex flex-row justify-between px-5 my-5">
        <Text className="text-xl font-bold">Tất cả tin nhắn</Text>
        <Text
          className="text-xl font-bold"
          onPress={() => navigation.navigate("UnreadMessageScreen")}
        >
          Tin chưa đọc
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#555" />
          <Text className="mt-2 text-gray-500">Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="mb-20">
            {chatList.length === 0 ? (
              <Text className="text-center text-gray-500 mt-10">
                Bạn chưa có cuộc trò chuyện nào
              </Text>
            ) : (
              chatList.map((room, i) => (
                <TouchableOpacity
                  key={i}
                  className="flex flex-row mb-6 px-4"
                  onPress={() => handleOpenRoom(room)} // ✅ gọi hàm xử lý
                >
                  <Image
                    className="w-[46px] h-[46px] rounded-full"
                    source={{
                      uri:
                        room.partner?.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                    }}
                  />
                  <View className="w-[88%] pl-2 border-b border-gray-200 pb-2">
                    <View className="flex flex-row justify-between">
                      <Text className="text-lg font-semibold">
                        {room.partner?.name || "Người dùng ẩn danh"}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {new Date(room.last_message_at).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </Text>
                    </View>
                    <Text
  className={`${
    room.unread_count > 0 ? "font-bold text-black" : "text-gray-500"
  }`}
  numberOfLines={1}
>
  {room.unread_count > 9
    ? "Hơn 9 tin nhắn mới"
    : room.unread_count > 0
    ? `${room.unread_count} tin nhắn mới`
    : room.last_message || "(chưa có tin nhắn)"}
</Text>

                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Menu dưới */}
      <Menu />
    </View>
  );
}
