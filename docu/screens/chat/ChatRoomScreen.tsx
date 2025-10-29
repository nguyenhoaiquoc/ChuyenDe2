import { StatusBar } from "expo-status-bar";
import { Text, View, Alert, Image, TouchableOpacity, KeyboardAvoidingView, ScrollView, TextInput } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker'; // Import thư viện chọn ảnh
import { path } from "../../config"; // Đảm bảo đường dẫn đúng

import { io, Socket } from "socket.io-client"; // nếu bạn vẫn muốn dùng io(path) ở đây

type Props = {
  navigation: any;
  route: any;
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

  const [messages, setMessages] = useState<any[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<{ online: boolean; lastOnlineAt?: string }>({ online: false });
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<any[]>([]); // Lưu danh sách ảnh đã chọn
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
          mediaUrl: msg.media_url, // Lưu URL ảnh nếu có
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
          mediaUrl: m.media_url, // Lưu URL ảnh nếu có
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

  // ─── Hàm gửi tin nhắn và ảnh ─────────────────────────────────────────────
const handleSend = async () => {
  if (!content.trim() && selectedImages.length === 0) return;

  try {
    let imageUrl: string | undefined;

    // Nếu có ảnh, upload trước
    if (selectedImages.length > 0) {
      const formData = new FormData();
      formData.append("file", {
        uri: selectedImages[0].uri,
        type: "image/jpeg",
        name: "upload.jpg",
      } as any);

      const uploadRes = await axios.post(`${path}/chat/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Upload thành công:", uploadRes.data.url);
      imageUrl = uploadRes.data.url;
    }

    // Emit tin nhắn (văn bản + ảnh nếu có)
    socketRef.current?.emit("sendMessage", {
      room_id: String(roomId),
      sender_id: String(currentUserId),
      receiver_id: String(otherUserId),
      content: content.trim(),
      media_url: imageUrl ?? undefined, // <-- chính xác
    });

    // Hiển thị lên UI ngay (optimistic)
    setMessages((prev) => [
      ...prev,
      {
        text: content.trim(),
        time: new Date().toLocaleTimeString("vi-VN").slice(0, 5),
        senderId: String(currentUserId),
        mediaUrl: imageUrl,
      },
    ]);

    setContent("");
    setSelectedImages([]);

  } catch (err) {
    console.error("❌ Lỗi gửi ảnh:", err);
  }
};


  // Chọn ảnh từ thư viện hoặc camera
  const handleImageUpload = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 4, // Cho phép chọn tối đa 4 ảnh
        quality: 1,
      });
    }

    if (!result.canceled && result.assets) {
      setSelectedImages(result.assets); // Lưu danh sách ảnh đã chọn
    }
  };

  // Xóa ảnh
  const removeImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
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
            <View key={index} className={`flex flex-col gap-1 ${isMe ? "self-end" : "self-start"} mb-3`}>
              {/* Hiển thị hình ảnh nếu có */}
             {msg.mediaUrl && (
  <Image
    source={{ uri: msg.mediaUrl }}
    style={{ width: 200, height: 200, borderRadius: 12 }}
  />
)}

{msg.text?.trim() ? (
  <Text
    className={`${isMe ? "bg-yellow-200" : "bg-gray-200"} px-3 py-3 rounded-xl max-w-[70%]`}
  >
    {msg.text}
  </Text>
) : null} 
              
              {/* Hiển thị thời gian */}
              <Text className={`text-gray-400 text-xs ${isMe ? "self-end" : "self-start"}`}>
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

          {/* Chọn ảnh */}
          <View className="flex flex-row gap-4">
            <View className="flex flex-row bg-gray-300 px-4 py-2 rounded-full gap-2">
              <FontAwesome5 name="image" size={20} color="gray" />
              <TouchableOpacity onPress={() => handleImageUpload(false)}>
                <Text>Chọn ảnh</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-gray-300 px-4 py-2 rounded-full">
              <Text>Địa chỉ</Text>
            </View>
          </View>

          {/* Hiển thị ảnh đã chọn */}
          <View className="flex flex-row gap-2 mt-2">
            {selectedImages.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => removeImage(index)}>
                <Image source={{ uri: image.uri }} style={{ width: 50, height: 50, borderRadius: 8 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
