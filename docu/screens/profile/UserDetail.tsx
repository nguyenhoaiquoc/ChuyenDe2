import React, { useState, useEffect, useCallback } from "react"; // <<< 1. THÊM useCallback
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
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import { path } from "../../config";
// <<< 2. THÊM useFocusEffect
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../types";
import { TabView, SceneMap, TabBar } from "react-native-tab-view"; 
import { StatusBar } from "expo-status-bar"; 
import "../../global.css"; 

// ---------------------------------
// BẮT ĐẦU PHẦN TABS (TỪ USERINFO)
// ---------------------------------
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
// ---------------------------------
// KẾT THÚC PHẦN TABS
// ---------------------------------

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
  // --- LOGIC CỦA USERPROFILE (GIỮ NGUYÊN) ---
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

  // <<< 3. THAY THẾ useEffect bằng useFocusEffect
 useFocusEffect(
  useCallback(() => {
    let isActive = true;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        if (userId) {
          const res = await axios.get( `${path}/users/${userId}/info`);
          if (isActive) {
            setUser(res.data);
            setLoading(false);
            
            await AsyncStorage.setItem("userName", res.data.fullName || "");
            await AsyncStorage.setItem(
              "userAddress",
              res.data.address_json?.full || ""
            );
            await AsyncStorage.setItem("userAvatar", res.data.image || "");
          }
        }
      } catch (err: any) {
        console.log("❌ Lỗi tải user profile:", err.message);
        if (isActive) {
          Alert.alert("Lỗi", "Không thể tải thông tin người dùng này.");
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    // cleanup tránh memory leak
    return () => {
      isActive = false;
    };
  }, [userId])
);
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
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
  // --- KẾT THÚC LOGIC CỦA USERPROFILE ---

  // --- LOGIC UI TABS (TỪ USERINFO) ---
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
  // --- KẾT THÚC LOGIC UI TABS ---

section:loading
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-600 mt-3">Đang tải hồ sơ...</Text>
      </View>
    );
  }

  // Lấy ảnh từ state (logic của UserProfile)
  const coverImageUrl = user?.coverImage
    ? { uri: user.coverImage.startsWith("http") ? user.coverImage : `${path}${user.coverImage}` }
    : require("../../assets/anhbia.jpg"); // 👈 Dùng ảnh bìa mặc định

  const avatarImageUrl = user?.image
    ? { uri: user.image.startsWith("http") ? user.image : `${path}${user.image}` }
    : require("../../assets/meo.jpg"); // 👈 Dùng ảnh mèo mặc định

  // ---------------------------------
  // BẮT ĐẦU GIAO DIỆN MỚI (TỪ USERINFO)
  // ---------------------------------
  return (
    <ScrollView className="flex-1">
      <View className="mt-10">
        <StatusBar style="auto" />
        {/* Header (UI từ UserInfo, Data từ UserProfile) */}
        <View className="flex flex-row gap-6 pl-6 items-center">
          <FontAwesome
            onPress={() => navigation.goBack()}
            name="arrow-left"
            size={20}
            color="#000"
          />
          <Text className="text-xl">{user?.fullName || "Đang tải..."}</Text>
        </View>

        {/* Ảnh bìa + avatar (UI từ UserInfo, Data từ UserProfile) */}
        <View className="w-full h-[100px] relative mt-2">
          <Image
            className="w-full h-full object-contain"
            source={coverImageUrl}
            resizeMode="cover" // Dùng resizeMode
          />
          {/* Bỏ nút camera ảnh bìa */}

          <View className="w-[60px] h-[60px] absolute -bottom-6 left-5 bg-white p-1 rounded-full">
            <Image
              className="w-full h-full object-contain rounded-full"
              source={avatarImageUrl}
              resizeMode="cover" // Dùng resizeMode
            />
            {/* Bỏ nút camera avatar */}
          </View>
        </View>

        {/* ✅✅✅ THAY ĐỔI CHÍNH ✅✅✅
          Bỏ nút "Chỉnh sửa" & "Chia sẻ"
          Thay bằng nút "Báo cáo (...)" & "Theo dõi"
        */}
        <View className="flex flex-row justify-end gap-4 mt-8 mr-4">
          {/* Nút "..." (Báo cáo) */}
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="bg-gray-100 w-10 h-10 rounded-xl items-center justify-center shadow"
          >
            <MaterialIcons name="more-horiz" size={22} color="black" />
          </TouchableOpacity>

          {/* Nút "+ Theo dõi" */}
          <TouchableOpacity className="bg-orange-500 px-5 py-2 rounded-xl shadow active:bg-orange-600 h-10 items-center justify-center">
            <Text className="text-white font-semibold">+ Theo dõi</Text>
          </TouchableOpacity>
        </View>

        {/* Thông tin người dùng (UI từ UserInfo, Data từ UserProfile) */}
        <View className="pl-3 mt-4 flex flex-col gap-3">
          <Text className="font-bold">{user?.fullName || "Đang tải..."}</Text>
          <Text className="text-sm text-gray-600">Chưa có đánh giá</Text>
          <View className="flex flex-row gap-3">
            <Text className="border-r pr-2 text-xs">Người theo dõi: 1</Text>
            <Text className="text-xs">Đang theo dõi: 1</Text>
          </View>
        </View>

        {/* Mô tả + trạng thái (UI từ UserInfo, Data từ UserProfile) */}
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
              Đã tham gia: {timeSince(user?.createdAt || "")}
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
            <MaterialIcons name="more-horiz" size={16} color="blue" />
            <Text className="text-xs text-blue-600">Xem thêm</Text>
          </View>
        </View>

        {/* Tabs (UI từ UserInfo) */}
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

      {/* ✅ MODALS (LOGIC TỪ USERPROFILE)
        Giữ nguyên 2 modal "Báo cáo" và "Menu"
      */}
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
    </ScrollView>
  );
}