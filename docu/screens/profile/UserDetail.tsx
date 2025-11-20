import React, { useState, useEffect, useCallback } from "react";
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
  useWindowDimensions,
  TextInput,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import { path } from "../../config";
import { useRoute, RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RatingData, RootStackParamList, StarRatingProps } from "../../types";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { StatusBar } from "expo-status-bar";
import "../../global.css";

const DEFAULT_AVATAR = require("../../assets/khi.png");
const DEFAULT_COVER = require("../../assets/anhbia.jpg");
const DEFAULT_USER_AVATAR = require("../../assets/meo.jpg");

const StarRating = ({
  rating,
  onRatingChange,
  editable = false,
}: StarRatingProps) => {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => editable && onRatingChange?.(star)}
          disabled={!editable}
        >
          <FontAwesome
            name={star <= rating ? "star" : "star-o"}
            size={20}
            color="#facc15" // text-yellow-400
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const RatingCard = ({ rating }: { rating: RatingData }) => {
  const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " giờ trước";
    return "Vừa xong";
  };

  return (
    <View
      className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm"
      // Các style shadow tương đương: shadow-black/5 elevation-1
    >
      <View className="flex-row items-center mb-2">
        <Image
          source={
            rating.reviewer.avatar
              ? { uri: rating.reviewer.avatar }
              : DEFAULT_AVATAR
          }
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="font-semibold text-sm">{rating.reviewer.name}</Text>
          <Text className="text-xs text-gray-500">
            {timeSince(rating.createdAt)}
          </Text>
        </View>
        <StarRating rating={rating.stars} editable={false} />
      </View>
      {rating.content && (
        <Text className="text-sm text-gray-700 mt-1">{rating.content}</Text>
      )}
    </View>
  );
};

const DisplayingRoute = () => (
  <View className="flex-1 items-center justify-center py-10">
    <Text className="font-semibold text-gray-800">
      Người dùng chưa có tin đăng nào
    </Text>
  </View>
);

const SoldRoute = () => (
  <View className="flex-1 items-center justify-center py-10">
    <Text className="font-semibold text-gray-500">
      Người dùng chưa bán sản phẩm nào
    </Text>
  </View>
);

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
  const route =
    useRoute<
      RouteProp<{ params: { userId: number | string; productId: string } }>
    >();
  const { userId, productId } = route.params;

  // --- STATES THÊM VÀO TỪ HÀM RATING ---
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [myRating, setMyRating] = useState<RatingData | null>(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [ratingContent, setRatingContent] = useState("");

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [ratingMenuVisible, setRatingMenuVisible] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 1, label: "Hình đại diện sản phẩm" },
    { id: 2, label: "Thông tin cá nhân sai phạm" },
    { id: 3, label: "Người bán có dấu hiệu lừa đảo" },
    { id: 4, label: "Lý do khác" },
  ];

  // 3. HÀM TẢI DỮ LIỆU BAN ĐẦU (KẾT HỢP)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const storedId = await AsyncStorage.getItem("userId");
    const id = storedId ? Number(storedId) : null;
    setCurrentUserId(id);

    const checkRatingEndpoint = `${path}/users/${userId}/check-rating`;
    const ratingHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const apiCalls = [
      axios.get(`${path}/users/${userId}`),
      axios.get(`${path}/users/${userId}/ratings`),
      axios.get(`${path}/users/${userId}/rating-average`),
      id && id !== Number(userId)
        ? axios.get(checkRatingEndpoint, { headers: ratingHeaders })
        : Promise.resolve({ data: { hasRated: false } }),
    ];

    try {
      const [userRes, ratingsRes, avgRes, checkRes] =
        await Promise.all(apiCalls);

      setUser(userRes.data);
      setRatings(ratingsRes.data);
      setAverageRating(
        typeof avgRes.data.average === "number"
          ? avgRes.data.average
          : Number(avgRes.data.average) || null
      );
      setRatingCount(avgRes.data.count);

      if (checkRes.data.hasRated) {
        setMyRating(checkRes.data);
        setSelectedStars(checkRes.data.stars);
        setRatingContent(checkRes.data.content || "");
      } else {
        setMyRating(null);
        setSelectedStars(0);
        setRatingContent("");
      }
    } catch (err: any) {
      console.log("Lỗi tải user profile hoặc ratings:", err.message);
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng này.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAllData();
    }
  }, [userId, fetchAllData]);

  // 4. HÀM GỬI ĐÁNH GIÁ
  const handleSubmitRating = async () => {
    if (selectedStars === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn số sao đánh giá");
      return;
    }
    setLoading(true);
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để gửi đánh giá.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = `${path}/users/${userId}/rate`;
      const res = await axios.post(
        endpoint,
        { stars: selectedStars, content: ratingContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", res.data.message);
      setRatingModalVisible(false);

      await fetchAllData();
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err.response?.data?.message || "Không thể gửi đánh giá"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmitReport = async () => {
    // Logic báo cáo giữ nguyên
    setReportVisible(false);
    setSelectedIds([]);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(`YOUR_BASE_URL/user/${userId}`);
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

  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "displaying", title: "Đang hiển thị (0)" },
    { key: "sold", title: "Đã bán (0)" },
  ]);

  const renderScene = SceneMap({
    displaying: DisplayingRoute,
    sold: SoldRoute,
  });

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-600 mt-3">Đang tải hồ sơ...</Text>
      </View>
    );
  }

  const coverImageUrl = user?.coverImage
    ? {
        uri: user.coverImage.startsWith("http")
          ? user.coverImage
          : `${path}${user.coverImage}`,
      }
    : DEFAULT_COVER;

  const avatarImageUrl = user?.image
    ? {
        uri: user.image.startsWith("http")
          ? user.image
          : `${path}${user.image}`,
      }
    : DEFAULT_USER_AVATAR;

  const isOwnProfile = currentUserId === Number(userId);

  // BẮT ĐẦU GIAO DIỆN CHÍNH
  return (
    <ScrollView className="flex-1">
      <View className="mt-10">
        <StatusBar style="auto" />
        {/* Header */}
        <View className="flex flex-row gap-6 pl-6 items-center">
          <FontAwesome
            onPress={() => navigation.goBack()}
            name="arrow-left"
            size={20}
            color="#000"
          />
          <Text className="text-xl">{user?.fullName || "Đang tải..."}</Text>
        </View>

        {/* Ảnh bìa + avatar */}
        <View className="w-full h-[100px] relative mt-2">
          <Image
            className="w-full h-full object-contain"
            source={coverImageUrl}
            resizeMode="cover"
          />
          <View className="w-[60px] h-[60px] absolute -bottom-6 left-5 bg-white p-1 rounded-full">
            <Image
              className="w-full h-full object-contain rounded-full"
              source={avatarImageUrl}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex flex-row justify-end gap-4 mt-8 mr-4">
          {/* Nút "..." (Menu/Báo cáo) */}
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="bg-gray-100 w-10 h-10 rounded-xl items-center justify-center shadow"
          >
            <MaterialIcons name="more-horiz" size={22} color="black" />
          </TouchableOpacity>

          {/* Nút "+ Theo dõi" (Chỉ hiện khi không phải hồ sơ của mình) */}
          {!isOwnProfile && (
            <TouchableOpacity className="bg-orange-500 px-5 py-2 rounded-xl shadow active:bg-orange-600 h-10 items-center justify-center">
              <Text className="text-white font-semibold">+ Theo dõi</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Thông tin người dùng + RATING DISPLAY */}
        <View className="pl-3 mt-4 flex flex-col gap-3">
          <Text className="font-bold text-lg">
            {user?.fullName || "Đang tải..."}
          </Text>

          {/* ===== RATING + NÚT 3 CHẤM HOẶC BÚT (ĐÃ FIX 100%) ===== */}
          <View className="flex-row items-center">
            {/* Hiển thị sao + số đánh giá */}
            {averageRating !== null ? (
              <View className="flex-row items-center gap-2">
                <StarRating
                  rating={Math.round(averageRating)}
                  editable={false}
                />
                <Text className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({ratingCount} đánh giá)
                </Text>
              </View>
            ) : (
              <Text className="text-sm text-gray-600">Chưa có đánh giá</Text>
            )}

            {/* NÚT 3 CHẤM: chỉ hiện khi đã đánh giá + không phải chính mình */}
            {myRating && !isOwnProfile && (
              <TouchableOpacity
                onPress={() => setRatingMenuVisible(true)}
                className="ml-3 p-2 -mr-2" // p-2 để dễ bấm, -mr-2 để sát mép
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <MaterialIcons name="more-vert" size={22} color="#555" />
              </TouchableOpacity>
            )}

            {/* NÚT BÚT: chỉ hiện khi chưa đánh giá + không phải chính mình */}
            {!myRating && !isOwnProfile && (
              <TouchableOpacity
                onPress={() => setRatingModalVisible(true)}
                className="ml-3 p-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="edit" size={18} color="#3b82f6" />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex flex-row gap-3">
            <Text className="border-r border-gray-200 pr-2 text-xs text-gray-700">
              Người theo dõi: 1
            </Text>
            <Text className="text-xs text-gray-700">Đang theo dõi: 1</Text>
          </View>
        </View>

        {/* Mô tả + trạng thái */}
        <View className="pl-3 flex flex-col mt-6 gap-3">
          <View className="flex flex-row gap-1 items-center">
            <MaterialIcons name="chat" size={16} color="gray" />
            <Text className="text-xs text-gray-600">
              Phản hồi chat: chưa có thông tin
            </Text>
          </View>
          <View className="flex flex-row gap-1 items-center">
            <MaterialIcons name="calendar-today" size={16} color="gray" />
            <Text className="text-xs text-gray-600">
              Đã tham gia: {timeSince(user?.createdAt || "")} trước
            </Text>
          </View>
          <View className="flex flex-row gap-1 items-center">
            <MaterialIcons name="check-circle" size={16} color="gray" />
            <Text className="text-xs text-gray-600">Đã xác thực: </Text>
            <MaterialIcons name="mail" size={16} color="blue" />
          </View>
          <View className="flex flex-row gap-1 items-center">
            <MaterialIcons name="near-me" size={16} color="gray" />
            <Text className="text-xs text-gray-600">
              Địa chỉ: {user?.address_json?.full || "Chưa cung cấp"}
            </Text>
          </View>
          <View className="flex flex-row gap-1 items-center">
            <Text className="text-xs text-blue-600"> Xem thêm</Text>
          </View>
        </View>

        {/* ✅ RATINGS LIST */}
        {ratings.length > 0 && (
          <View className="px-4 mt-6">
            <Text className="text-base font-semibold mb-3">
              Đánh giá từ người dùng ({ratingCount})
            </Text>
            {ratings.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
          </View>
        )}

        {/* Tabs */}
        <View className="mt-8 h-[350px]">
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={(props: any) => (
              <TabBar
                {...props}
                indicatorStyle={{
                  backgroundColor: "#facc15",
                  height: 3,
                  borderRadius: 2,
                }}
                style={{
                  backgroundColor: "white",
                  elevation: 0,
                  shadowOpacity: 0,
                }}
                labelStyle={{
                  color: "#000",
                  fontWeight: "600",
                  textTransform: "none",
                  fontSize: 13,
                }}
                activeColor="#000"
                inactiveColor="#9ca3af"
              />
            )}
          />
        </View>
      </View>

      {/* MODALS CŨ (Menu & Report) */}
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
              <Text className="text-gray-700 text-center">
                Sao chép liên kết
              </Text>
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
                  selectedIds.includes(item.id) ? "bg-orange-100" : "bg-gray-50"
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
                  selectedIds.length === 0 ? "text-gray-500" : "text-white"
                }`}
              >
                Gửi báo cáo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setReportVisible(false)}
              className="mt-3 py-2 rounded-xl bg-gray-100"
            >
              <Text className="text-center text-gray-700 font-medium">Hủy</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/*  RATING MODAL MỚI*/}
      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setRatingModalVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white w-80 rounded-xl p-5 shadow-lg"
          >
            <Text className="text-lg font-semibold text-center mb-5">
              {myRating ? "Chỉnh sửa đánh giá" : "Đánh giá người dùng"}
            </Text>

            <View className="items-center mb-4">
              <StarRating
                rating={selectedStars}
                onRatingChange={setSelectedStars}
                editable={true}
              />
            </View>

            <TextInput
              className="border border-gray-300 rounded-lg p-3 h-24 text-sm mb-4"
              placeholder="Nhận xét của bạn (tùy chọn)"
              multiline
              value={ratingContent}
              onChangeText={setRatingContent}
              style={{ textAlignVertical: "top" }}
            />

            <TouchableOpacity
              onPress={handleSubmitRating}
              disabled={selectedStars === 0}
              className={`py-3 rounded-xl mb-3 ${
                selectedStars === 0
                  ? "bg-gray-300"
                  : "bg-orange-500 active:bg-orange-600"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  selectedStars === 0 ? "text-gray-500" : "text-white"
                }`}
              >
                {myRating ? "Cập nhật" : "Gửi đánh giá"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setRatingModalVisible(false);
                setSelectedStars(myRating?.stars || 0);
                setRatingContent(myRating?.content || "");
              }}
              className="bg-gray-100 py-2 rounded-xl"
            >
              <Text className="text-center text-gray-700 font-medium">Hủy</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL MENU 3 CHẤM */}
      <Modal
        visible={ratingMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingMenuVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setRatingMenuVisible(false)}
        >
          <View className="flex-1 justify-center items-center">
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-72"
            >
              <TouchableOpacity
                onPress={() => {
                  setRatingMenuVisible(false);
                  setRatingModalVisible(true);
                }}
                className="px-5 py-4 flex-row items-center gap-3 border-b border-gray-200"
              >
                <MaterialIcons name="edit" size={20} color="#666" />
                <Text className="text-base">Chỉnh sửa đánh giá</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setRatingMenuVisible(false);
                  Alert.alert(
                    "Xóa đánh giá",
                    "Bạn có chắc chắn muốn xóa đánh giá này không?",
                    [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Xóa",
                        style: "destructive",
                        onPress: async () => {
                          setLoading(true);
                          try {
                            const token = await AsyncStorage.getItem("token");
                            await axios.delete(`${path}/users/${userId}/rate`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            Alert.alert("Thành công", "Đã xóa đánh giá");
                            await fetchAllData();
                          } catch (err: any) {
                            Alert.alert(
                              "Lỗi",
                              err.response?.data?.message || "Không thể xóa"
                            );
                          } finally {
                            setLoading(false);
                          }
                        },
                      },
                    ]
                  );
                }}
                className="px-5 py-4 flex-row items-center gap-3"
              >
                <MaterialIcons
                  name="delete-outline"
                  size={20}
                  color="#ef4444"
                />
                <Text className="text-base text-red-500">Xóa đánh giá</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
