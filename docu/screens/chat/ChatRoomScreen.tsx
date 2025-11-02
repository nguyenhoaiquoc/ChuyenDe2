import { StatusBar } from "expo-status-bar";
import { Text, View, Alert, Image, TouchableOpacity, KeyboardAvoidingView, ScrollView, TextInput, Modal } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import { io, Socket } from "socket.io-client";
import { path } from "../../config";

type Props = { navigation: any; route: any };

type UiMsg = {
  id: string;
  text: string;
  time: string;
  senderId: string;
  mediaUrl?: string | null;
  isRecalled: boolean;
  replyToId?: string | null;
  edited?: boolean;
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

  const [contextVisible, setContextVisible] = useState(false);
  const [contextMsg, setContextMsg] = useState<UiMsg | null>(null);
  const [messages, setMessages] = useState<UiMsg[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<{ online: boolean; lastOnlineAt?: string }>({ online: false });
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<TextInput>(null);

  // trạng thái trả lời
  const [replyTarget, setReplyTarget] = useState<null | {
    id: string;
    text?: string;
    mediaUrl?: string | null;
    senderId: string;
  }>(null);

  // trạng thái chỉnh sửa
  const [editTarget, setEditTarget] = useState<null | { id: string }>(null);

  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // ========= helpers =========
  const timeAgo = (dateString?: string) => {
    if (!dateString) return "lâu rồi";
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày`;
    return "lâu rồi";
  };

  const openContextMenu = (msg: UiMsg) => {
    setContextMsg(msg);
    setContextVisible(true);
  };
  const closeContextMenu = () => {
    setContextVisible(false);
    setContextMsg(null);
  };

  const handleCopy = async () => {
    if (!contextMsg) return;
    try {
      if (contextMsg.text?.trim()) await Clipboard.setStringAsync(contextMsg.text);
      else if (contextMsg.mediaUrl) await Clipboard.setStringAsync(contextMsg.mediaUrl);
      Alert.alert("Đã sao chép");
    } catch {}
    closeContextMenu();
  };

  const handleRecall = () => {
    if (!contextMsg) return;
    socketRef.current?.emit("recallMessage", { message_id: Number(contextMsg.id) });
    // optimistic UI
    setMessages((prev) =>
      prev.map((m) => (m.id === contextMsg.id ? { ...m, isRecalled: true, text: "", mediaUrl: null } : m))
    );
    closeContextMenu();
  };

  const handleReply = () => {
    if (!contextMsg) return;
    // nếu đang edit thì hủy edit để ưu tiên reply
    setEditTarget(null);
    setReplyTarget({
      id: contextMsg.id,
      text: contextMsg.text,
      mediaUrl: contextMsg.mediaUrl ?? null,
      senderId: contextMsg.senderId,
    });
    closeContextMenu();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleEdit = () => {
    if (!contextMsg) return;
    // nếu đang reply thì hủy reply để ưu tiên edit
    setReplyTarget(null);
    setEditTarget({ id: contextMsg.id });
    setContent(contextMsg.text || "");
    closeContextMenu();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // ========= socket connect & events =========
  useEffect(() => {
    const socket = io(path, {
      auth: { userId: String(currentUserId), token },
    });
    socketRef.current = socket;

    // join room để nhận event theo room_<id>
    socket.emit("joinRoom", { room_id: String(roomId) });

    // tin nhắn mới (từ người kia)
    socket.on("receiveMessage", (msg: any) => {
      if (String(msg.sender_id) === String(currentUserId)) return;
      setMessages((prev) => [
        ...prev,
        {
          id: String(msg.id ?? msg._id ?? `${msg.created_at}-${msg.sender_id}`),
          text: msg.content ?? "",
          time: new Date(msg.created_at).toLocaleTimeString("vi-VN").slice(0, 5),
          senderId: String(msg.sender_id),
          mediaUrl: msg.media_url ?? null,
          isRecalled: Boolean(msg.is_recalled),
          replyToId: msg.reply_to_id ? String(msg.reply_to_id) : null,
        },
      ]);
    });

    // lịch sử
    socket.emit("getMessagesByRoom", { roomId: String(roomId) });
    socket.emit("markAsRead", { roomId: String(roomId), userId: currentUserId });

    socket.on("loadMessages", (msgs: any[]) => {
      const mapped: UiMsg[] = msgs.map((m) => ({
        id: String(m.id ?? m._id ?? `${m.created_at}-${m.sender_id}`),
        text: m.content ?? "",
        time: new Date(m.created_at).toLocaleTimeString("vi-VN").slice(0, 5),
        senderId: String(m.sender_id),
        mediaUrl: m.media_url ?? null,
        isRecalled: Boolean(m.is_recalled),
        replyToId: m.reply_to_id ? String(m.reply_to_id) : null,
      }));
      setMessages(mapped);
    });

    // trạng thái online
    socket.on("userOnline", ({ userId, online }) => {
      if (String(userId) === String(otherUserId)) {
        setOnlineStatus((prev) => ({ ...prev, online }));
      }
    });

    // tin nhắn bị thu hồi
    socket.on("messageRecalled", (payload: { id: number; recalled_at?: string }) => {
      const idStr = String(payload.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === idStr ? { ...m, isRecalled: true, text: "", mediaUrl: null } : m))
      );
    });

    // tin nhắn được chỉnh sửa
    socket.on("messageEdited", (msg: any) => {
      const idStr = String(msg.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === idStr
            ? {
                ...m,
                text: msg.content ?? "",
                edited: true,
                time: new Date(msg.updated_at ?? Date.now()).toLocaleTimeString("vi-VN").slice(0, 5),
              }
            : m
        )
      );
    });

    // tin nhắn reply mới
    socket.on("newReply", (msg: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(msg.id),
          text: msg.content ?? "",
          time: new Date(msg.created_at ?? Date.now()).toLocaleTimeString("vi-VN").slice(0, 5),
          senderId: String(msg.sender_id),
          mediaUrl: msg.media_url ?? null,
          isRecalled: Boolean(msg.is_recalled),
          replyToId: msg.reply_to_id ? String(msg.reply_to_id) : null,
        },
      ]);
    });

    // trạng thái ban đầu
    axios
      .get(`${path}/chat/online-status/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOnlineStatus({ online: res.data.online, lastOnlineAt: res.data.lastOnlineAt }))
      .catch(() => {});

    return () => {
      socket.disconnect();
    };
  }, []);

  // auto scroll
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ======= map id -> message (để lấy snippet reply, KHÔNG dùng hook trong .map) =======
  const msgById = useMemo(() => {
    const map = new Map<string, UiMsg>();
    messages.forEach((m) => map.set(m.id, m));
    return map;
  }, [messages]);

  // ========= gửi tin nhắn =========
  const handleSend = async () => {
    if (!content.trim() && selectedImages.length === 0) return;

    // 🔧 Nếu đang CHỈNH SỬA
    if (editTarget) {
      socketRef.current?.emit("editMessage", {
        message_id: Number(editTarget.id),
        content: content.trim(),
      });

      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === editTarget.id ? { ...m, text: content.trim(), edited: true } : m))
      );

      setContent("");
      setEditTarget(null);
      return;
    }

    try {
      let imageUrl: string | undefined;

      if (selectedImages.length > 0) {
        const formData = new FormData();
        formData.append("file", {
          uri: selectedImages[0].uri,
          type: "image/jpeg",
          name: "upload.jpg",
        } as any);

        const uploadRes = await axios.post(`${path}/chat/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadRes.data.url;
      }

      const now = new Date();
      const baseOptimistic: UiMsg = {
        id: `${now.getTime()}-${currentUserId}`,
        text: content.trim(),
        time: now.toLocaleTimeString("vi-VN").slice(0, 5),
        senderId: String(currentUserId),
        mediaUrl: imageUrl ?? null,
        isRecalled: false,
        replyToId: replyTarget ? String(replyTarget.id) : null,
      };

      if (replyTarget) {
        // đang trả lời: backend event replyMessage
        socketRef.current?.emit("replyMessage", {
          room_id: String(roomId),
          receiver_id: String(otherUserId),
          content: content.trim(),
          reply_to_id: Number(replyTarget.id),
          // nếu muốn gửi kèm ảnh cho reply: mở rộng backend để nhận media_url
          // media_url: imageUrl ?? undefined,
        });
      } else {
        // gửi thường
        socketRef.current?.emit("sendMessage", {
          room_id: String(roomId),
          sender_id: String(currentUserId),
          receiver_id: String(otherUserId),
          content: content.trim(),
          media_url: imageUrl ?? undefined,
        });
      }

      // optimistic
      setMessages((prev) => [...prev, baseOptimistic]);
      setContent("");
      setSelectedImages([]);
      setReplyTarget(null);
    } catch (err) {
      console.error("❌ Lỗi gửi tin:", err);
    }
  };

  // ========= chọn & xóa ảnh =========
  const handleImageUpload = async (useCamera: boolean) => {
    if (useCamera) {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.status !== "granted") return Alert.alert("Thiếu quyền", "Cần cấp quyền Camera để chụp ảnh.");
    } else {
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libPerm.status !== "granted") return Alert.alert("Thiếu quyền", "Cần cấp quyền Thư viện ảnh để chọn ảnh.");
    }

    let result: ImagePicker.ImagePickerResult;
    result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          selectionLimit: 4,
          quality: 1,
        });

    if (!result.canceled && result.assets) {
      setSelectedImages((prev) => [...prev, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...selectedImages];
    updated.splice(index, 1);
    setSelectedImages(updated);
  };

  // ========= render =========
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="flex flex-row mt-14 items-center px-5 justify-between border-b border-gray-200 pb-2">
        <View className="flex flex-row items-center gap-4">
          <FontAwesome5 name="arrow-left" size={20} color="gray" onPress={() => navigation.goBack()} />
          <View className="flex flex-row gap-2 items-center">
            <Image className="w-[46px] h-[46px] rounded-full" source={{ uri: otherUserAvatar || DEFAULT_AVATAR }} />
            <View>
              <Text className="font-semibold">{otherUserName}</Text>
              <Text className="text-gray-400 text-xs">
                {onlineStatus.online ? "Đang hoạt động" : `Hoạt động ${timeAgo(onlineStatus.lastOnlineAt)} trước`}
              </Text>
            </View>
          </View>
        </View>
        <FontAwesome5 name="bars" size={20} color="gray" />
      </View>

      {/* Danh sách tin nhắn */}
      <ScrollView ref={scrollViewRef} className="flex-1 px-5" contentContainerStyle={{ paddingVertical: 10 }}>
        {messages.map((msg) => {
          const isMe = String(msg.senderId) === String(currentUserId);

          // Lấy snippet của tin gốc (không dùng Hook trong .map)
          const origin = msg.replyToId ? msgById.get(msg.replyToId) : undefined;
          const replySnippet = origin
            ? {
                who: String(origin.senderId) === String(currentUserId) ? "bạn" : "đối phương",
                text: origin.mediaUrl ? "[Ảnh]" : origin.text || "",
              }
            : null;

        return (
          <View key={msg.id} className={`flex flex-col gap-1 ${isMe ? "self-end" : "self-start"} mb-3 max-w-[80%]`}>
            {/* Ô trích (mờ) */}
            {replySnippet && !msg.isRecalled && (
              <View className={`${isMe ? "bg-yellow-100" : "bg-gray-100"} px-3 py-2 rounded-lg mb-1`} style={{ opacity: 0.7 }}>
                <Text className="text-[11px] text-gray-600" numberOfLines={1}>
                  Trả lời {replySnippet.who}
                </Text>
                <Text className="text-[12px] text-gray-700" numberOfLines={2}>
                  {replySnippet.text}
                </Text>
              </View>
            )}

            {/* Bong bóng */}
            <TouchableOpacity activeOpacity={0.8} onLongPress={() => openContextMenu(msg)}>
              {msg.isRecalled ? (
                <Text className="italic text-gray-400 text-sm">Tin nhắn đã được thu hồi</Text>
              ) : (
                <>
                  {msg.mediaUrl ? (
                    <Image source={{ uri: msg.mediaUrl }} style={{ width: 220, height: 220, borderRadius: 12 }} />
                  ) : null}
                  {msg.text?.trim() ? (
                    <Text className={`${isMe ? "bg-yellow-200" : "bg-gray-200"} px-3 py-3 rounded-xl`} style={{ overflow: "hidden" }}>
                      {msg.text}
                      {msg.edited ? <Text className="text-gray-500 text-xs"> (đã chỉnh sửa)</Text> : null}
                    </Text>
                  ) : null}
                </>
              )}
            </TouchableOpacity>

            <Text className={`text-gray-400 text-xs ${isMe ? "self-end" : "self-start"}`}>{msg.time}</Text>
          </View>
        );
        })}
      </ScrollView>

      {/* Context Menu */}
      <Modal visible={contextVisible} transparent animationType="fade" onRequestClose={closeContextMenu}>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white px-4 py-3 rounded-t-2xl">
            <TouchableOpacity className="py-3" onPress={handleCopy}>
              <Text className="text-base">Sao chép</Text>
            </TouchableOpacity>

            {contextMsg && String(contextMsg.senderId) === String(currentUserId) && !contextMsg.isRecalled && (
              <>
                <TouchableOpacity className="py-3" onPress={handleRecall}>
                  <Text className="text-base text-red-600">Thu hồi</Text>
                </TouchableOpacity>

                {/* Nút Chỉnh sửa */}
                <TouchableOpacity className="py-3" onPress={handleEdit}>
                  <Text className="text-base text-blue-600">Chỉnh sửa</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity className="py-3" onPress={handleReply}>
              <Text className="text-base">Trả lời</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-3" onPress={closeContextMenu}>
              <Text className="text-base text-gray-500">Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Input */}
      <KeyboardAvoidingView behavior="padding">
        <View className="pb-1 pt-4 px-5 w-full bg-gray-100 shadow-xl rounded-t-2xl">
          {/* Thanh trạng thái EDIT */}
          {editTarget && (
            <View className="mb-2 bg-yellow-100 border-l-4 border-yellow-400 px-3 py-2 rounded">
              <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-gray-700">Đang chỉnh sửa tin nhắn</Text>
                <TouchableOpacity onPress={() => setEditTarget(null)}>
                  <Text className="text-blue-600">Hủy</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-gray-600 text-xs">Nhập nội dung mới và bấm Gửi để cập nhật</Text>
            </View>
          )}

          {/* Ô trích khi đang trả lời (chỉ hiển thị khi KHÔNG ở chế độ edit) */}
          {!editTarget && replyTarget && (
            <View className="mb-2 bg-gray-100 border-l-4 border-gray-400 px-3 py-2 rounded">
              <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-gray-700">
                  Trả lời {String(replyTarget.senderId) === String(currentUserId) ? "chính bạn" : "đối phương"}
                </Text>
                <TouchableOpacity onPress={() => setReplyTarget(null)}>
                  <Text className="text-blue-600">Đóng</Text>
                </TouchableOpacity>
              </View>
              <Text numberOfLines={2} className="text-gray-600">
                {replyTarget.mediaUrl ? "[Ảnh]" : replyTarget.text || ""}
              </Text>
            </View>
          )}

          {/* TextInput + nút Gửi */}
          <View className="mb-2 relative">
            <TextInput
              ref={inputRef}
              className="w-full px-4 py-2 rounded-lg bg-white"
              value={content}
              onChangeText={setContent}
              placeholder={editTarget ? "Nhập nội dung mới..." : "Nhập tin nhắn..."}
            />
            <TouchableOpacity onPress={handleSend} className="absolute right-2 top-2 bg-blue-500 px-3 py-2 rounded-lg">
              <Text className="text-white font-semibold">{editTarget ? "Cập nhật" : "Gửi"}</Text>
            </TouchableOpacity>
          </View>

          {/* Hàng nút: ảnh (ẩn khi đang edit để tránh hiểu nhầm) */}
          {!editTarget && (
            <>
              <View className="flex flex-row gap-3">
                <View className="flex flex-row bg-gray-300 px-4 py-2 rounded-full gap-2 items-center">
                  <FontAwesome5 name="image" size={18} color="gray" />
                  <TouchableOpacity onPress={() => handleImageUpload(false)}>
                    <Text>Chọn ảnh</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex flex-row bg-gray-300 px-4 py-2 rounded-full gap-2 items-center">
                  <FontAwesome5 name="camera" size={18} color="gray" />
                  <TouchableOpacity onPress={() => handleImageUpload(true)}>
                    <Text>Chụp ảnh</Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-gray-300 px-4 py-2 rounded-full">
                  <Text>Địa chỉ</Text>
                </View>
              </View>

              {/* Preview ảnh */}
              <View className="flex flex-row gap-2 mt-2">
                {selectedImages.map((image, index) => (
                  <TouchableOpacity key={`${image.uri}-${index}`} onPress={() => removeImage(index)}>
                    <Image source={{ uri: image.uri }} style={{ width: 50, height: 50, borderRadius: 8 }} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
