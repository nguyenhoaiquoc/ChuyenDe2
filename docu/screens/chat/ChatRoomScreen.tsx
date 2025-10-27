import {
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5 } from "@expo/vector-icons";
<<<<<<< HEAD
import { useState, useRef, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useRoute, RouteProp } from "@react-navigation/native";
import { io, Socket } from "socket.io-client";
import { path } from '../../config';
type ChatRoomRouteProp = RouteProp<RootStackParamList, "ChatRoomScreen">;
=======
import { useState, useRef, useEffect } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRoute, RouteProp } from "@react-navigation/native";
import { io, Socket } from "socket.io-client";
import { path } from "../../config";
import {
  ChatRoomNavigationProp,
  ChatRoomRouteProp,
} from "../../types";
>>>>>>> e6bd1a6094cac90d7c947e4d43ee15ecd1f5932c

type Props = {
  navigation: ChatRoomNavigationProp;
  route: ChatRoomRouteProp;
};

<<<<<<< HEAD
export default function ChatRoomScreen({ navigation }: Props) {
  const route = useRoute<ChatRoomRouteProp>();
  const { product, otherUserId, otherUserName, currentUserId, currentUserName, token } = route.params;


  const [messages, setMessages] = useState<{ text: string; time: string; senderId: number }[]>([]);
  const [content, setContent] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

const socketRef = useRef<Socket | null>(null);

useEffect(() => {
  socketRef.current = io(path, {
    auth: { userId: currentUserId, token: `Bearer ${token}` },
  });


  // ✅ Lắng nghe tin nhắn mới
  socketRef.current.on("receiveMessage", (msg: any) => {
    setMessages(prev => [
      ...prev,
      {
        text: msg.content ?? "",
        time: new Date(msg.created_at).toLocaleTimeString().slice(0, 5),
        senderId: msg.sender_id,
      }
    ]);
  });

  // Load tin nhắn cũ khi mở chat
  socketRef.current.emit("getMessages", { userA: currentUserId, userB: otherUserId });
  socketRef.current.on("loadMessages", (msgs: any[]) => {
    setMessages(msgs.map(m => ({
      text: m.content ?? "",
      time: new Date(m.created_at).toLocaleTimeString().slice(0, 5),
      senderId: m.sender_id,
    })));
  });

  return () => {
    socketRef.current?.disconnect();
  };
}, []);
=======
export default function ChatRoomScreen({ navigation, route  }: Props) {

   const {
    roomId,
    product,
    otherUserId,
    otherUserName,
    currentUserId,
    currentUserName,
    token,
  } = route.params;

  const [messages, setMessages] = useState<
    { text: string; time: string; senderId: string | number }[]
  >([]);
  const [content, setContent] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);

  // ─── Kết nối socket ───────────────────────────────────────────────
  useEffect(() => {
    socketRef.current = io(path, {
  auth: { userId: String(currentUserId), token }, 
    });

    // ✅ Nhận tin nhắn mới
    socketRef.current.on("receiveMessage", (msg: any) => {
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
    socketRef.current.emit("getMessagesByRoom", { roomId: String(roomId) });

    socketRef.current.on("loadMessages", (msgs: any[]) => {
      setMessages(
        msgs.map((m) => ({
          text: m.content ?? "",
          time: new Date(m.created_at).toLocaleTimeString("vi-VN").slice(0, 5),
          senderId: String(m.sender_id),
        }))
      );
    });
>>>>>>> e6bd1a6094cac90d7c947e4d43ee15ecd1f5932c


  // ─── Tự động scroll xuống khi có tin nhắn mới ──────────────────────
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ─── Gửi tin nhắn ─────────────────────────────────────────────────
  const handleSend = () => {
    if (!content.trim() || !socketRef.current) return;
<<<<<<< HEAD
  console.log("🔥 Gửi tin nhắn:", content);

    socketRef.current.emit("sendMessage", newMessage);

=======

    const newMessage = {
      room_id: String(roomId),
      sender_id: String(currentUserId),
      receiver_id: String(otherUserId),
      content: content.trim(),
    };

    socketRef.current.emit("sendMessage", newMessage);

>>>>>>> e6bd1a6094cac90d7c947e4d43ee15ecd1f5932c
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
<<<<<<< HEAD
              source={{ uri: product.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
=======
              source={{
                uri:
                  product?.image ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
>>>>>>> e6bd1a6094cac90d7c947e4d43ee15ecd1f5932c
            />
            <View>
              <Text className="font-semibold">{otherUserName}</Text>
              <Text className="text-gray-400 text-xs">
                Hoạt động 2 giờ trước
              </Text>
            </View>
          </View>
        </View>
        <FontAwesome5 name="bars" size={20} color="gray" />
      </View>

      {/* Chat messages */}
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
<<<<<<< HEAD
              className={`flex flex-col gap-1 ${isMe ? 'self-end' : 'self-start'} mb-3`}
            >
              <Text className={`${isMe ? 'bg-yellow-200' : 'bg-gray-200'} px-3 py-3 rounded-xl max-w-[70%]`}>
                {msg.text}
              </Text>
              <Text className={isMe ? 'self-end text-gray-400 text-xs' : 'text-gray-400 text-xs'}>
=======
              className={`flex flex-col gap-1 ${
                isMe ? "self-end" : "self-start"
              } mb-3`}
            >
              <Text
                className={`${
                  isMe ? "bg-yellow-200" : "bg-gray-200"
                } px-3 py-3 rounded-xl max-w-[70%]`}
              >
                {msg.text}
              </Text>
              <Text
                className={`text-gray-400 text-xs ${
                  isMe ? "self-end" : "self-start"
                }`}
              >
>>>>>>> e6bd1a6094cac90d7c947e4d43ee15ecd1f5932c
                {msg.time}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior="padding">
        <View className="pb-1 pt-4 px-5 w-full bg-gray-100 shadow-xl rounded-t-2xl">
          <View className="mb-2 relative">
            <TextInput
              className="w-full bg-white px-4 py-2 rounded-lg"
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
