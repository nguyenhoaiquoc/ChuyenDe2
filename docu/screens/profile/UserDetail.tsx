import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import { path } from "../../config";
import { useRoute, RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../types";

type UserProfileData = {
  id: number;
  fullName: string;
  email: string;
  image: string;
  coverImage: string;
  address_json: { full: string };
  createdAt: string;
};

interface MenuItem {
  id: number;
  label: string;
}

export default function UserProfile({ navigation }: any) {
  const route = useRoute<
    RouteProp<{ params: { userId: number | string; productId: string } }>
  >();
  const { userId, productId } = route.params;

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 1, label: "Hình đại diện sản phẩm" },
    { id: 2, label: "Thông tin cá nhân sai phạm" },
    { id: 3, label: "Người bán có dấu hiệu lừa đảo" },
    { id: 4, label: "Lý do khác" },
  ];

  useEffect(() => {
    if (userId) {
      axios
        .get(`${path}/users/${userId}`)
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.log("Lỗi tải user profile:", err.message);
          Alert.alert("Lỗi", "Không thể tải thông tin người dùng này.");
          setLoading(false);
          navigation.goBack();
        });
    }
  }, [userId]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmitReport = async () => {
    if (selectedIds.length === 0) return;

    const reporterId = await AsyncStorage.getItem("userId");
    if (!reporterId) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để báo cáo.");
      return;
    }

    const data = {
      product_id: productId,
      reporter_id: Number(reporterId),
      reported_user_id: userId,
      reason: selectedIds
        .map((id) => menuItems.find((m) => m.id === id)?.label)
        .join(", "),
      created_at: new Date().toISOString(),
    };

    try {
      const res = await axios.post(`${path}/reports`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201 || res.status === 200) {
        Alert.alert("Thành công", "Báo cáo đã được gửi!");
      } else {
        Alert.alert("Lỗi", "Máy chủ phản hồi không hợp lệ.");
      }
    } catch (error: any) {
      console.log("Lỗi gửi báo cáo:", error.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể gửi báo cáo. Kiểm tra mạng hoặc server.");
    }

    setReportVisible(false);
    setSelectedIds([]);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync("https://imsport.vn/user/congcong");
    setMenuVisible(false);
    Alert.alert("Đã sao chép", "Liên kết hồ sơ đã được sao chép.");
  };

  const timeSince = (dateString: string): string => {
    if (!dateString) return "Chưa rõ";
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + " năm";
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + " tháng";
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " ngày";
    return "Hôm nay";
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-600 mt-3">Đang tải hồ sơ...</Text>
      </View>
    );
  }

  const coverImageUrl = user?.coverImage
    ? { uri: user.coverImage.startsWith("http") ? user.coverImage : `${path}${user.coverImage}` }
    : require("../../assets/hoa.png");

  const avatarImageUrl = user?.image
    ? { uri: user.image.startsWith("http") ? user.image : `${path}${user.image}` }
    : require("../../assets/hoa.png");

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="relative">
        <Image
          source={coverImageUrl}
          className="w-full h-36 opacity-80"
          resizeMode="cover"
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-10 left-5 bg-black/40 p-2 rounded-full"
        >
          <FontAwesome5 name="arrow-left" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View className="items-center -mt-12">
        <Image
          source={avatarImageUrl}
          className="w-28 h-28 rounded-full border-4 border-white shadow-md"
        />
        <Text className="text-lg font-bold mt-3">{user?.fullName}</Text>
        <Text className="text-gray-500 text-sm">Người theo dõi: 16</Text>
      </View>

      {/* Actions */}
      <View className="flex-row justify-center gap-3 mt-4">
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          className="bg-gray-100 w-10 h-10 rounded-xl items-center justify-center shadow"
        >
          <MaterialIcons name="more-horiz" size={22} color="black" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-orange-500 px-5 py-2 rounded-xl shadow active:bg-orange-600">
          <Text className="text-white font-semibold">+ Theo dõi</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View className="px-5 mt-6 space-y-3">
        <View className="flex-row items-center">
          <Ionicons name="chatbubbles-outline" size={18} color="#6b7280" />
          <Text className="ml-2 text-gray-700">Phản hồi chat: </Text>
          <Text className="text-gray-500">Thỉnh thoảng</Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={18} color="#6b7280" />
          <Text className="ml-2 text-gray-700">Đã tham gia: </Text>
          <Text className="text-gray-500">{timeSince(user?.createdAt || "")}</Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={18} color="#6b7280" />
          <Text className="ml-2 text-gray-700">Địa chỉ: </Text>
          <Text className="text-gray-500 flex-shrink">Chưa rõ địa chỉ</Text>
        </View>
      </View>

      {/* Menu modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setMenuVisible(false)}
        >
          <View className="bg-white w-72 rounded-2xl shadow-lg p-3">
            <TouchableOpacity
              onPress={handleCopyLink}
              className="px-4 py-3 border-b border-gray-200"
            >
              <Text className="text-gray-700 text-center">Nhắn tin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                setReportVisible(true);
              }}
              className="px-4 py-3"
            >
              <Text className="text-red-500 text-center font-medium">
                Báo cáo vi phạm
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Report modal */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setReportVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white w-80 rounded-2xl p-5 shadow"
          >
            <Text className="text-base font-semibold text-center mb-4">
              Người bán này có vấn đề gì?
            </Text>

            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleToggleSelect(item.id)}
                className={`py-2 rounded-lg mb-1 ${
                  selectedIds.includes(item.id)
                    ? "bg-orange-100"
                    : "bg-gray-50"
                }`}
              >
                <Text
                  className={`text-center ${
                    selectedIds.includes(item.id)
                      ? "text-orange-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleSubmitReport}
              disabled={selectedIds.length === 0}
              className={`mt-4 py-3 rounded-xl ${
                selectedIds.length === 0
                  ? "bg-gray-300"
                  : "bg-red-500 active:bg-red-600"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  selectedIds.length === 0
                    ? "text-gray-500"
                    : "text-white"
                }`}
              >
                Gửi báo cáo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setReportVisible(false)}
              className="mt-3 py-2 rounded-xl bg-gray-100"
            >
              <Text className="text-center text-gray-700 font-medium">
                Hủy
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <View className="h-10" />
    </ScrollView>
  );
}
