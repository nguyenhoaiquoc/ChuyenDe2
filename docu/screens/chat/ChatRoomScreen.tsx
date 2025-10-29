import { StatusBar } from "expo-status-bar";
import { Text, View, Alert, Linking, Image, TouchableOpacity, KeyboardAvoidingView, ScrollView, TextInput } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { path } from "../../config";
import { useIsFocused } from "@react-navigation/native"; // ✅ để lắng nghe focus

import { io, Socket } from "socket.io-client"; // nếu bạn vẫn muốn dùng io(path) ở đây

type Props = {
  navigation: any; // Define proper types if you have the correct navigation types
  route: any; // Same here for route types
};

export default function ChatRoomScreen({ navigation, route }: Props) {
  const {
    roomId,
    product,
    otherUserId,
    otherUserName,
    otherUserAvatar,
    currentUserId,
    currentUserName,
    token,
  } = route.params;

  const isFocused = useIsFocused(); // ✅ lắng nghe focus

  const [messages, setMessages] = useState<any[]>([]); // use proper types
  const [onlineStatus, setOnlineStatus] = useState<{ online: boolean; lastOnlineAt?: string }>({
    online: false,
  });

  const [content, setContent] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);

  // ─── Kết nối socket, lắng nghe tin nhắn & trạng thái online ───────
  useEffect(() => {
    const socket = io(path, {
      auth: { userId: String(currentUserId), token },
    });
    socketRef.current = socket;

    // ✅ Nhận tin nhắn mới
    socket.on("receiveMessage", (msg: any) => {
      if (String(msg.sender_id) === String(currentUserId)) return; // bỏ qua tin của mình
      setMessages((prev) => [
        ...prev,
        {
          text: msg.content ?? "",
          time: new Date(msg.created_at).toLocaleTimeString("vi-VN").slice(0, 5),
          senderId: String(msg.sender_id),
        },
      ]);
    });

    // ✅ Lấy tin nhắn cũ khi mở phòng
    socket.emit("getMessagesByRoom", { roomId: String(roomId) });
    socket.emit("markAsRead", { roomId: String(roomId), userId: currentUserId });

    socket.on("loadMessages", (msgs: any[]) => {
      setMessages(
        msgs.map((m) => ({
          text: m.content ?? "",
          time: new Date(m.created_at).toLocaleTimeString("vi-VN").slice(0, 5),
          senderId: String(m.sender_id),
        }))
      );
    });

    // ✅ Lắng nghe thay đổi trạng thái online/offline
    socket.on("userOnline", ({ userId, online }) => {
      if (String(userId) === String(otherUserId)) {
        setOnlineStatus((prev) => ({ ...prev, online }));
      }
    });

    // ✅ Lấy trạng thái ban đầu
    axios
      .get(`${path}/chat/online-status/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOnlineStatus({
          online: res.data.online,
          lastOnlineAt: res.data.lastOnlineAt,
        });
      })
      .catch(() => {});

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []); // Mỗi lần mớì vào (mount lần đầu)

  // ─── Tự động scroll xuống khi có tin nhắn mới ──────────────────────
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // ─── Lắng nghe focus để lấy trạng thái online lại
  useEffect(() => {
    if (isFocused) {
      axios
        .get(`${path}/chat/online-status/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setOnlineStatus({
            online: res.data.online,
            lastOnlineAt: res.data.lastOnlineAt,
          });
        })
        .catch(() => {});
    }
  }, [isFocused]); // ✅ Sẽ gọi API khi màn hình trở lại focus

  // ─── Hàm gửi tin nhắn ─────────────────────────────────────────────
  const handleSend = () => {
    if (!content.trim() || !socketRef.current) return;

    const newMessage = {
      room_id: String(roomId),
      sender_id: String(currentUserId),
      receiver_id: String(otherUserId),
      content: content.trim(),
    };

    socketRef.current.emit("sendMessage", newMessage);

    // Hiển thị ngay tin nhắn (optimistic UI)
    setMessages((prev) => [
      ...prev,
      {
        text: content.trim(),
        time: new Date().toLocaleTimeString("vi-VN").slice(0, 5),
        senderId: String(currentUserId),
      },
    ]);
    setContent("");
  };

  // ─── Hiển thị thời gian “Hoạt động ... trước” ─────────────────────
  function timeAgo(dateString?: string) {
    if (!dateString) return "lâu rồi";
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày`;
    return "lâu rồi";
  }

  const DEFAULT_AVATAR =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // ─── Render UI ────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="flex flex-row mt-14 items-center px-5 justify-between border-b border-gray-200 pb-2">
        <View className="flex flex-row items-center gap-4">
          <FontAwesome5
            name="arrow-left"
            size={20}
            color="gray"
            onPress={() => navigation.goBack()}
          />
          <View className="flex flex-row gap-2 items-center">
            <Image
              className="w-[46px] h-[46px] rounded-full"
              source={{
                uri: otherUserAvatar || DEFAULT_AVATAR,
              }}
            />
            <View>
              <Text className="font-semibold">{otherUserName}</Text>
              <Text className="text-gray-400 text-xs">
                {onlineStatus.online
                  ? "Đang hoạt động"
                  : `Hoạt động ${timeAgo(onlineStatus.lastOnlineAt)} trước`}
              </Text>
            </View>
          </View>
        </View>
        <FontAwesome5 name="bars" size={20} color="gray" />
      </View>

      {/* Tin nhắn */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 10 }}
      >
        {messages.map((msg, index) => {
          const isMe = String(msg.senderId) === String(currentUserId);
          return (
            <View
              key={index}
              className={`flex flex-col gap-1 ${isMe ? "self-end" : "self-start"} mb-3`}
            >
              <Text
                className={`${
                  isMe ? "bg-yellow-200" : "bg-gray-200"
                } px-3 py-3 rounded-xl max-w-[70%]`}
              >
                {msg.text}
              </Text>
              <Text
                className={`text-gray-400 text-xs ${isMe ? "self-end" : "self-start"}`}
              >
                {msg.time}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior="padding">
        <View className="pb-1 pt-10 px-5 w-full bg-gray-100 shadow-xl rounded-t-2xl">
          <View className="mb-2 relative">
            <TextInput
              className="w-full px-4 py-2 rounded-lg"
              value={content}
              onChangeText={setContent}
              placeholder="Nhập tin nhắn..."
            />
            <TouchableOpacity
              onPress={handleSend}
              className="absolute right-2 top-2 bg-blue-500 px-3 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Gửi</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row gap-4">
            <View className="flex flex-row bg-gray-300 px-4 py-2 rounded-full gap-2">
              <FontAwesome5 name="image" size={20} color="gray" />
              <Text>Hình ảnh & video</Text>
            </View>

            <View className="bg-gray-300 px-4 py-2 rounded-full">
              <Text>Địa chỉ</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}