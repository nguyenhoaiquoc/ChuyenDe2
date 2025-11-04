import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  createdAtISO?: string;
};

export default function ChatRoomScreen({ navigation, route }: Props) {
  const {
    roomId,
    product: productFromParams,
    otherUserId: otherUserIdFromParams,
    otherUserName: otherUserNameFromParams,
    otherUserAvatar: otherUserAvatarFromParams,
    highlightMessageId,
    searchKeyword: searchKeywordFromParams, // nhận keyword từ Search
  } = route.params || {};

  const [jwt, setJwt] = useState<string | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [t, uid] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("userId"),
      ]);
      setJwt(t || null);
      setSelfId(uid || null);
    })();
  }, []);

  const [headerMeta, setHeaderMeta] = useState<{ name?: string; avatar?: string } | null>(null);
  const [contextVisible, setContextVisible] = useState(false);
  const [contextMsg, setContextMsg] = useState<UiMsg | null>(null);
  const [messages, setMessages] = useState<UiMsg[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<{ online: boolean; lastOnlineAt?: string }>({ online: false });
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<TextInput>(null);

  const [replyTarget, setReplyTarget] = useState<null | {
    id: string;
    text?: string;
    mediaUrl?: string | null;
    senderId: string;
  }>(null);
  const [editTarget, setEditTarget] = useState<null | { id: string }>(null);

  // Theo dõi vị trí scroll và điều khiển auto-scroll lần đầu vào phòng
  const [isNearBottom, setIsNearBottom] = useState(true);
  const initialAutoScrollDoneRef = useRef(false);

  // Reset cờ auto-scroll khi đổi phòng hoặc có highlight
  useEffect(() => {
    initialAutoScrollDoneRef.current = false;
  }, [roomId, highlightMessageId]);

  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const otherUserId = otherUserIdFromParams ?? null;
  const otherUserName = otherUserNameFromParams ?? headerMeta?.name ?? "Người dùng";
  const otherUserAvatar = otherUserAvatarFromParams ?? headerMeta?.avatar ?? DEFAULT_AVATAR;

  const searchKeyword = (searchKeywordFromParams ?? "").toString().trim();

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
    setMessages((prev) =>
      prev.map((m) => (m.id === contextMsg.id ? { ...m, isRecalled: true, text: "", mediaUrl: null } : m))
    );
    closeContextMenu();
  };

  const handleReply = () => {
    if (!contextMsg) return;
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
    setReplyTarget(null);
    setEditTarget({ id: contextMsg.id });
    setContent(contextMsg.text || "");
    closeContextMenu();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // ========= Socket connect =========
  useEffect(() => {
    if (!jwt || !roomId) return;

    const socket = io(path, {
      transports: ["websocket"],
      autoConnect: true,
      auth: { token: jwt },
    });
    socketRef.current = socket;

    socket.emit("joinRoom", { room_id: String(roomId) });

    socket.on("receiveMessage", (msg: any) => {
      if (selfId && String(msg.sender_id) === String(selfId)) return;
      pushOneToList(msg);
    });

    socket.on("loadMessages", (msgs: any[]) => {
      const mapped: UiMsg[] = msgs.map(mapMsgToUi);
      setMessages(mapped);
    });

    socket.on("userOnline", ({ userId, online }) => {
      if (otherUserId && String(userId) === String(otherUserId)) {
        setOnlineStatus((prev) => ({ ...prev, online }));
      }
    });

    socket.on("messageRecalled", (payload: { id: number; recalled_at?: string }) => {
      const idStr = String(payload.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === idStr ? { ...m, isRecalled: true, text: "", mediaUrl: null } : m))
      );
    });

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

    socket.on("newReply", (msg: any) => {
      pushOneToList(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [jwt, roomId, selfId, otherUserId]);

  // Online status
  useEffect(() => {
    if (!jwt || !otherUserId) return;
    axios
      .get(`${path}/chat/online-status/${otherUserId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => setOnlineStatus({ online: res.data.online, lastOnlineAt: res.data.lastOnlineAt }))
      .catch(() => {});
  }, [jwt, otherUserId]);

  // Header meta (khi thiếu)
  useEffect(() => {
    if (!jwt || !roomId) return;
    if (otherUserNameFromParams) return;
    axios
      .get(`${path}/chat/room/${roomId}/meta`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        const meta = res.data?.data;
        setHeaderMeta({
          name: meta?.partner?.name,
          avatar: meta?.partner?.avatar,
        });
      })
      .catch(() => {});
  }, [jwt, roomId, otherUserNameFromParams]);

  // Load messages (around anchor nếu có)
  useEffect(() => {
    if (!jwt || !roomId) return;

    const run = async () => {
      try {
        if (highlightMessageId) {
          const res = await axios.get(`${path}/chat/history/${roomId}/around`, {
            headers: { Authorization: `Bearer ${jwt}` },
            params: { messageId: Number(highlightMessageId), window: 40 },
          });
          const data = res.data?.data;
          const ui = (data?.items || []).map(mapMsgToUi);
          setMessages(ui);

          setTimeout(() => {
            const anchorIndex = typeof data?.anchorIndex === "number" ? data.anchorIndex : null;
            if (anchorIndex != null) {
              scrollViewRef.current?.scrollTo({
                y: anchorIndex * 68,
                animated: true,
              });
            }
          }, 80);
        } else {
          socketRef.current?.emit("getMessagesByRoom", { roomId: String(roomId) });
        }

        await axios.post(`${path}/chat/mark-read/${roomId}`, {}, { headers: { Authorization: `Bearer ${jwt}` } });
      } catch (e) {
        try {
          const res = await axios.get(`${path}/chat/history/${roomId}`, {
            headers: { Authorization: `Bearer ${jwt}` },
            params: { limit: 30 },
          });
          const ui = (res.data?.data || []).map(mapMsgToUi);
          setMessages(ui);
        } catch {}
      }
    };
    run();
  }, [jwt, roomId, highlightMessageId]);

  // Auto scroll khi có tin mới (nếu đang ở gần cuối và không xem highlight)
  useEffect(() => {
    if (!highlightMessageId && isNearBottom) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, highlightMessageId, isNearBottom]);

  const msgById = useMemo(() => {
    const map = new Map<string, UiMsg>();
    messages.forEach((m) => map.set(m.id, m));
    return map;
  }, [messages]);

  // Theo dõi scroll để biết có đang gần đáy không
  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setIsNearBottom(distanceFromBottom < 100);
  };

  // Đảm bảo cuộn đúng thời điểm sau khi nội dung render xong:
  const handleContentSizeChange = () => {
    if (highlightMessageId) return; // đang xem anchor thì không kéo xuống cuối

    // Lần đầu mở phòng: cuộn xuống cuối ngay (không animation để tránh nháy)
    if (!initialAutoScrollDoneRef.current) {
      scrollViewRef.current?.scrollToEnd({ animated: false });
      initialAutoScrollDoneRef.current = true;
      return;
    }

    // Các lần nội dung tăng sau đó: chỉ auto-scroll nếu đang ở gần đáy
    if (isNearBottom) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleSend = async () => {
    if (!selfId || (!content.trim() && selectedImages.length === 0)) return;

    if (editTarget) {
      socketRef.current?.emit("editMessage", {
        message_id: Number(editTarget.id),
        content: content.trim(),
      });
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
          headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "multipart/form-data" },
        });

        imageUrl = uploadRes.data.url;
      }

      const now = new Date();
      const baseOptimistic: UiMsg = {
        id: `${now.getTime()}-${selfId}`,
        text: content.trim(),
        time: now.toLocaleTimeString("vi-VN").slice(0, 5),
        senderId: String(selfId),
        mediaUrl: imageUrl ?? null,
        isRecalled: false,
        replyToId: replyTarget ? String(replyTarget.id) : null,
        createdAtISO: now.toISOString(),
      };

      if (replyTarget) {
        socketRef.current?.emit("replyMessage", {
          room_id: String(roomId),
          receiver_id: String(otherUserId || ""),
          content: content.trim(),
          reply_to_id: Number(replyTarget.id),
        });
      } else {
        socketRef.current?.emit("sendMessage", {
          room_id: String(roomId),
          sender_id: String(selfId),
          receiver_id: String(otherUserId || ""),
          content: content.trim(),
          media_url: imageUrl ?? undefined,
        });
      }

      setMessages((prev) => [...prev, baseOptimistic]);
      setContent("");
      setSelectedImages([]);
      setReplyTarget(null);
    } catch (err) {
      console.error("❌ Lỗi gửi tin:", err);
    }
  };

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

  function mapMsgToUi(m: any): UiMsg {
    const created = m.created_at ? new Date(m.created_at) : new Date();
    return {
      id: String(m.id ?? m._id ?? `${created.toISOString()}-${m.sender_id}`),
      text: m.content ?? "",
      time: created.toLocaleTimeString("vi-VN").slice(0, 5),
      senderId: String(m.sender_id),
      mediaUrl: m.media_url ?? null,
      isRecalled: Boolean(m.is_recalled),
      replyToId: m.reply_to_id ? String(m.reply_to_id) : null,
      edited: Boolean(m.is_edited),
      createdAtISO: created.toISOString(),
    };
  }

  function pushOneToList(msg: any) {
    const ui = mapMsgToUi(msg);
    setMessages((prev) => [...prev, ui]);
  }

  // ===== Highlight helpers =====
  function splitHighlight(text: string, keyword: string) {
    if (!keyword) return [{ text, hit: false }];
    const k = keyword.toLowerCase();
    const t = text || "";
    const tl = t.toLowerCase();
    const out: { text: string; hit: boolean }[] = [];
    let i = 0;
    while (true) {
      const idx = tl.indexOf(k, i);
      if (idx === -1) { out.push({ text: t.slice(i), hit: false }); break; }
      if (idx > i) out.push({ text: t.slice(i, idx), hit: false });
      out.push({ text: t.slice(idx, idx + k.length), hit: true });
      i = idx + k.length;
    }
    return out;
  }

  function InlineHighlight({ text, keyword }: { text: string; keyword: string }) {
    const parts = useMemo(() => splitHighlight(text, keyword), [text, keyword]);
    if (!keyword) return <Text>{text}</Text>;
    return (
      <Text>
        {parts.map((p, idx) =>
          p.hit ? (
            <Text key={idx} className="bg-yellow-300 rounded-sm">{p.text}</Text>
          ) : (
            <Text key={idx}>{p.text}</Text>
          )
        )}
      </Text>
    );
  }

  const renderReplyPreview = (msg: UiMsg) => {
    const origin = msg.replyToId ? msgById.get(msg.replyToId) : undefined;
    if (!origin) return null;
    const who = selfId && String(origin.senderId) === String(selfId) ? "bạn" : "đối phương";
    const txt = origin.mediaUrl ? "[Ảnh]" : origin.text || "";
    return (
      <View className={`${String(msg.senderId) === String(selfId) ? "bg-yellow-100" : "bg-gray-100"} px-3 py-2 rounded-lg mb-1`} style={{ opacity: 0.7 }}>
        <Text className="text-[11px] text-gray-600" numberOfLines={1}>Trả lời {who}</Text>
        <Text className="text-[12px] text-gray-700" numberOfLines={2}>
          <InlineHighlight text={txt} keyword={searchKeyword} />
        </Text>
      </View>
    );
  };

  if (!jwt || !selfId) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <StatusBar style="auto" />
        <Text className="text-gray-500">Đang khởi tạo phiên chat…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />

      {/* Header */}
<View className="flex flex-row mt-14 items-center px-5 justify-between border-b border-gray-200 pb-2">
  <View className="flex flex-row items-center gap-4">
    <FontAwesome5 name="arrow-left" size={20} color="gray" onPress={() => navigation.goBack()} />

    {/* 👇 Bọc avatar + tên bằng TouchableOpacity để mở UserInforScreen */}
    <TouchableOpacity
      className="flex flex-row gap-2 items-center"
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate("UserInforScreen", {
          userId: otherUserId ?? selfId, // nếu không có otherUserId thì mở profile của chính mình
        })
      }
    >
      <Image className="w-[46px] h-[46px] rounded-full" source={{ uri: otherUserAvatar }} />
      <View>
        <Text className="font-semibold">{otherUserName}</Text>
        <Text className="text-gray-400 text-xs">
          {onlineStatus.online ? "Đang hoạt động" : `Hoạt động ${timeAgo(onlineStatus.lastOnlineAt)} trước`}
        </Text>
      </View>
    </TouchableOpacity>
  </View>

  <FontAwesome5 name="bars" size={20} color="gray" />
</View>


      {/* Danh sách tin nhắn */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 10 }}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={100}
      >
        {messages.map((msg) => {
          const isMe = selfId && String(msg.senderId) === String(selfId);
          return (
            <View key={msg.id} className={`flex flex-col gap-1 ${isMe ? "self-end" : "self-start"} mb-3 max-w-[80%]`}>
              {/* Ô trích (mờ) */}
              {msg.replyToId && !msg.isRecalled ? renderReplyPreview(msg) : null}

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
                      <Text
                        className={`${isMe ? "bg-yellow-200" : "bg-gray-200"} px-3 py-3 rounded-xl`}
                        style={{ overflow: "hidden" }}
                      >
                        <InlineHighlight text={msg.text} keyword={searchKeyword} />
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

            {contextMsg && selfId && String(contextMsg.senderId) === String(selfId) && !contextMsg.isRecalled && (
              <>
                <TouchableOpacity className="py-3" onPress={handleRecall}>
                  <Text className="text-base text-red-600">Thu hồi</Text>
                </TouchableOpacity>
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

          {!editTarget && replyTarget && (
            <View className="mb-2 bg-gray-100 border-l-4 border-gray-400 px-3 py-2 rounded">
              <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-gray-700">
                  Trả lời {selfId && String(replyTarget.senderId) === String(selfId) ? "chính bạn" : "đối phương"}
                </Text>
                <TouchableOpacity onPress={() => setReplyTarget(null)}>
                  <Text className="text-blue-600">Đóng</Text>
                </TouchableOpacity>
              </View>
              <Text numberOfLines={2} className="text-gray-600">
                <InlineHighlight text={replyTarget.mediaUrl ? "[Ảnh]" : (replyTarget.text || "")} keyword={searchKeyword} />
              </Text>
            </View>
          )}

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
