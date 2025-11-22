import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import "../../global.css";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Notification, Product } from "../../types"; // 👈 Nhớ import Product
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    "NotificationScreen"
  >;
};

const filters = ["Tài khoản", "Giao dịch", "Tin đăng", "Sự kiện"];

export default function NotificationScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState("Hoạt động");

  //  STATE MỚI ĐỂ LƯU DATA VÀ LOADING
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState<
    number | null
  >(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy người dùng. Vui lòng đăng nhập lại."
        );
        setIsLoading(false);
        navigation.goBack();
        return;
      }

      let tabQueryParam = "";
      if (activeTab === "Tin tức") {
        tabQueryParam = "?tab=news";
      }

      const apiUrl = `${path}/notifications/user/${userId}${tabQueryParam}`;
      const response = await axios.get(apiUrl);
      const updated = await Promise.all(
        response.data.map(async (n: Notification) => {
          if (n.action?.name === "group_invitation") {
            const localStatus = await getHandledInvitation(n.target_id);
            if (localStatus) return { ...n, invitationStatus: localStatus };
          }
          return n;
        })
      );
      setNotifications(updated);
    } catch (error: any) {
      console.log("Lỗi khi tải thông báo:", error.message);
      Alert.alert("Lỗi", "Không thể tải danh sách thông báo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  // 🔹 Lưu trạng thái lời mời đã xử lý
  const saveHandledInvitation = async (
    invitationId: number,
    status: "accepted" | "rejected"
  ) => {
    try {
      const stored = await AsyncStorage.getItem("handledInvitations");
      const obj = stored ? JSON.parse(stored) : {};
      obj[invitationId] = status;
      await AsyncStorage.setItem("handledInvitations", JSON.stringify(obj));
    } catch (err) {
      console.log("❌ Lỗi lưu trạng thái lời mời:", err);
    }
  };

  // 🔹 Lấy trạng thái lời mời
  const getHandledInvitation = async (invitationId: number) => {
    try {
      const stored = await AsyncStorage.getItem("handledInvitations");
      const obj = stored ? JSON.parse(stored) : {};
      return obj[invitationId] || null;
    } catch (err) {
      console.log("❌ Lỗi lấy trạng thái lời mời:", err);
      return null;
    }
  };

  // ✅ Chấp nhận lời mời
  const handleAcceptInvitation = async (invitationId: number) => {
    setProcessingInvitation(invitationId);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${path}/groups/invitations/${invitationId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await saveHandledInvitation(invitationId, "accepted");
      Alert.alert(
        "Thành công",
        res.data.message || "Đã tham gia nhóm thành công"
      );
      await fetchNotifications(); // Cập nhật lại danh sách
    } catch (error: any) {
      console.error("Lỗi khi chấp nhận lời mời:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể chấp nhận lời mời"
      );
    } finally {
      setProcessingInvitation(null);
    }
  };

  const handleRejectInvitation = (invitationId: number) => {
    Alert.alert(
      "Xác nhận từ chối",
      "Bạn có chắc chắn muốn từ chối lời mời này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối 2",
          style: "destructive",
          onPress: async () => {
            setProcessingInvitation(invitationId);
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.post(
                `${path}/groups/invitations/${invitationId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              await saveHandledInvitation(invitationId, "rejected");
              // ✅ Cập nhật UI ngay
              setNotifications((prev) =>
                prev.map((n) =>
                  n.target_id === invitationId
                    ? { ...n, invitationStatus: "rejected" }
                    : n
                )
              );

              Alert.alert("Thành công", "Bạn đã từ chối lời mời thành công");
            } catch (error: any) {
              console.error("Lỗi khi từ chối lời mời:", error);
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể từ chối lời mời"
              );
            } finally {
              setProcessingInvitation(null);
            }
          },
        },
      ]
    );
  };

  //  HÀM XỬ LÝ KHI BẤM
  const handleNotificationPress = async (item: Notification) => {
    if (isNavigating) return;
    setIsNavigating(true);

    const userId = await AsyncStorage.getItem("userId");

    try {
      if (!item.is_read) {
        await axios.patch(
          `${path}/notifications/${item.id}/read/user/${userId}`
        );
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
      }

      if (item.targetType?.name === "product" && item.product?.id) {
        console.log(`Đang tải chi tiết sản phẩm ${item.product.id}...`);

        const response = await axios.get(`${path}/products/${item.product.id}`);
        const fullProductData: Product = response.data;

        navigation.navigate("ProductDetail", { product: fullProductData });
      }
    } catch (error: any) {
      console.error(
        "Lỗi khi xử lý thông báo:",
        error.response?.data || error.message
      );
      Alert.alert("Lỗi", "Không thể mở mục này.");
    } finally {
      setIsNavigating(false);
    }
  };

  //  HÀM : XỬ LÝ XÓA TẤT CẢ
  const handleDeleteAll = async () => {
    // 1. Lấy userId
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      return Alert.alert("Lỗi", "Không tìm thấy người dùng.");
    }

    try {
      // 2. Gọi API DELETE (endpoint ông vừa tạo)
      await axios.delete(`${path}/notifications/user/${userId}`);

      // 3. Xóa thành công, cập nhật UI
      setNotifications([]); // Set list rỗng
    } catch (error: any) {
      console.error(
        "Lỗi khi xóa thông báo:",
        error.response?.data || error.message
      );
      Alert.alert("Lỗi", "Không thể xóa thông báo.");
    }
  };

  //  HÀM  HIỆN CẢNH BÁO XÁC NHẬN
  const showConfirmDeleteAlert = () => {
    Alert.alert("Xóa tất cả thông báo?", "Hành động này không thể hoàn tác.", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        onPress: handleDeleteAll,
        style: "destructive",
      },
    ]);
  };

  //  HÀM RENDER ITEM
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    // Nếu là lời mời nhóm
    if (item.action?.name === "group_invitation") {
      return (
        <View
          className={`p-4 border-b border-gray-100 ${!item.is_read ? "bg-blue-50" : "bg-white"}`}
        >
          <View className="flex-row items-start">
            <Image
              source={
                item.actor?.image
                  ? { uri: item.actor.image }
                  : require("../../assets/khi.png")
              }
              className="w-12 h-12 rounded-full"
            />

            <View className="flex-1 ml-3">
              <View className="flex-row items-center mb-2">
                <Feather name="users" size={16} color="#3b82f6" />
                <Text className="ml-1 text-sm font-semibold text-gray-900">
                  Lời mời tham gia nhóm
                </Text>
              </View>

              <Text className="text-sm text-gray-700 mb-3">
                <Text className="font-semibold">
                  {item.actor?.fullName || "???"}
                </Text>{" "}
                đã mời bạn tham gia nhóm{" "}
                <Text className="font-semibold">{item.group?.name || ""}</Text>
              </Text>

              {/* Nút hành động */}
              <View className="mt-2">
                {item.invitationStatus === "accepted" ? (
                  <Text className="text-green-600 text-sm font-medium">
                    Bạn đã chấp nhận lời mời.
                  </Text>
                ) : item.invitationStatus === "rejected" ? (
                  <Text className="text-red-500 text-sm font-medium">
                    Bạn đã từ chối lời mời.
                  </Text>
                ) : (
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={async () => {
                        await handleAcceptInvitation(item.target_id);
                      }}
                      disabled={processingInvitation === item.target_id}
                      className="flex-1 bg-blue-500 py-2 rounded-lg mr-2"
                    >
                      {processingInvitation === item.target_id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text className="text-white text-center font-semibold text-sm">
                          Chấp nhận
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleRejectInvitation(item.target_id)}
                      disabled={processingInvitation === item.target_id}
                      className="flex-1 bg-gray-200 py-2 rounded-lg"
                    >
                      <Text className="text-gray-700 text-center font-semibold text-sm">
                        Từ chối
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text className="text-xs text-gray-400 mt-2">
                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>

            {!item.is_read && (
              <View className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2 mt-1" />
            )}
          </View>
        </View>
      );
    }

    // Các loại thông báo khác
    const formatMessage = (item: Notification) => {
      const actorName = (
        <Text className="font-bold">{item.actor?.fullName || "Một người"}</Text>
      );
      const productName = (
        <Text className="font-bold">{item.product?.name || "bài đăng"}</Text>
      );

      switch (item.action?.name) {
        case "following_new_post":
          return (
            <Text>
              {actorName} đã đăng một bài viết mới: {productName}
            </Text>
          );
        case "post_success":
          return <Text>Bạn đã đăng thành công {productName}.</Text>;
        case "admin_new_post":
          return (
            <Text>
              {actorName} vừa đăng {productName}.
            </Text>
          );
        case "favorite_product":
          return (
            <Text>
              {actorName} đã thích {productName} của bạn.
            </Text>
          );
        case "favorite_confirmation":
          return <Text>Bạn đã thích {productName}.</Text>;
        case "new_follow":
          return <Text>{actorName} đã đang theo dõi bạn.</Text>;
        default:
          return <Text>{actorName} đã có một hoạt động mới.</Text>;
      }
    };

    // Đây là return của renderNotificationItem
    return (
      <TouchableOpacity
        className={`flex-row items-start p-4 border-b border-gray-100 ${
          !item.is_read ? "bg-blue-50" : "bg-white"
        }`}
        onPress={() => handleNotificationPress(item)}
        disabled={isNavigating}
      >
        <Image
          source={
            item.actor?.image
              ? { uri: item.actor.image }
              : require("../../assets/khi.png")
          }
          className="w-10 h-10 rounded-full"
        />
        <View className="flex-1 ml-3">
          <Text className="text-sm leading-5">{formatMessage(item)}</Text>
          <Text className="text-xs text-gray-500 mt-1">
            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        {!item.is_read && (
          <View className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2 mt-1" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white mt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Thông báo</Text>
        <TouchableOpacity onPress={showConfirmDeleteAlert}>
          <Text className="text-sm text-red-500">Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigator */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => setActiveTab("Hoạt động")}
          className={`flex-1 py-3 items-center ${
            activeTab === "Hoạt động"
              ? "border-b-2 border-black"
              : "border-b border-gray-200"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "Hoạt động" ? "text-black" : "text-gray-500"
            }`}
          >
            Hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Tin tức")}
          className={`flex-1 py-3 items-center ${
            activeTab === "Tin tức"
              ? "border-b-2 border-black"
              : "border-b border-gray-200"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "Tin tức" ? "text-black" : "text-gray-500"
            }`}
          >
            Tin tức
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View className="px-4 pt-4 pb-2 border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full mr-2 border border-gray-200">
            <Ionicons name="filter" size={16} color="#333" />
            <Text className="ml-1 text-sm text-gray-800">Lọc</Text>
          </TouchableOpacity>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 border border-gray-200"
            >
              <Text className="text-sm text-gray-800">{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nội dung thông báo */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center bg-gray-50/50">
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center bg-gray-50/50">
            <Text className="text-gray-500">
              Hiện tại bạn chưa có thông báo nào
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id.toString()}
            className="bg-white"
          />
        )}
      </View>

      {/* Menu dưới cùng */}
      <Menu />
    </SafeAreaView>
  );
}
