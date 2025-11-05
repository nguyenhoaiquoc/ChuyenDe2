import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Product } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../config";
import ProductCard from "../../components/ProductCard";
import "../../global.css";
import { useNotification } from "../Notification/NotificationContext";

const statusTabs = ["Đã duyệt", "Chờ duyệt", "Từ chối", "Đã ẩn"];

const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return seconds < 5 ? "vừa xong" : `${seconds} giây trước`;
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  return Math.floor(interval) + " phút trước";
};

const mapProductData = (item: any): Product => {
  const imageUrl = (() => {
    if (!item.thumbnail_url && item.images?.length)
      return item.images[0].image_url;
    const url = item.thumbnail_url || "";
    if (url.startsWith("http")) return url;
    return `${path}${url}`;
  })();

  let locationText = "Chưa rõ địa chỉ";
  if (item.address_json) {
    try {
      const addr =
        typeof item.address_json === "string"
          ? JSON.parse(item.address_json)
          : item.address_json;
      if (addr.full) locationText = addr.full;
      else {
        const parts = [addr.ward, addr.district, addr.province]
          .filter(Boolean)
          .slice(-2);
        locationText = parts.length > 0 ? parts.join(", ") : "Chưa rõ địa chỉ";
      }
    } catch {
      locationText = "Chưa rõ địa chỉ";
    }
  }

  const createdAt = item.created_at
    ? new Date(new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000)
    : new Date();
  const timeDisplay = timeSince(createdAt);

  let tagText = "Không có danh mục";
  const categoryName = item.category?.name || null;
  const subCategoryName = item.subCategory?.name || null;
  if (categoryName && subCategoryName)
    tagText = `${categoryName} - ${subCategoryName}`;
  else if (categoryName) tagText = categoryName;
  else if (subCategoryName) tagText = subCategoryName;

  return {
    id: item.id.toString(),
    image: imageUrl,
    name: item.name || "Không có tiêu đề",
    price:
      item.dealType?.name === "Miễn phí"
        ? "Miễn phí"
        : item.dealType?.name === "Trao đổi"
          ? "Trao đổi"
          : item.price
            ? `${Number(item.price).toLocaleString("vi-VN")} đ`
            : "Liên hệ",
    location: locationText,
    time: timeDisplay,
    tag: tagText,
    authorName: item.user?.fullName || item.user?.name || "Ẩn danh",
    user_id: item.user?.id ?? item.user_id ?? 0,
    category: item.category || null,
    subCategory: item.subCategory
      ? {
          id: item.subCategory.id,
          name: item.subCategory.name,
          parent_category_id: item.subCategory.parent_category_id,
          source_table: item.subCategory.source_table,
          source_id: item.subCategory.source_id,
        }
      : null,
    category_change: item.category_change || null,
    sub_category_change: item.sub_category_change || null,
    imageCount: item.images?.length || (imageUrl ? 1 : 0),
    isFavorite: false,
    images: item.images || [],
    description: item.description || "",
    postType: item.postType || null,
    condition: item.condition || null,
    dealType: item.dealType || null,
    productStatus: item.productStatus || null,
    productType:
      item.productType && item.productType.name ? item.productType : null,
    origin: item.origin && item.origin.name ? item.origin : null,
    material: item.material && item.material.name ? item.material : null,
    size: item.size && item.size.name ? item.size : null,
    brand: item.brand && item.brand.name ? item.brand : null,
    color: item.color && item.color.name ? item.color : null,
    capacity: item.capacity && item.capacity.name ? item.capacity : null,
    warranty: item.warranty && item.warranty.name ? item.warranty : null,
    productModel:
      item.productModel && item.productModel.name ? item.productModel : null,
    processor: item.processor && item.processor.name ? item.processor : null,
    ramOption: item.ramOption && item.ramOption.name ? item.ramOption : null,
    storageType:
      item.storageType && item.storageType.name ? item.storageType : null,
    graphicsCard:
      item.graphicsCard && item.graphicsCard.name ? item.graphicsCard : null,
    breed: item.breed && item.breed.name ? item.breed : null,
    ageRange: item.ageRange && item.ageRange.name ? item.ageRange : null,
    gender: item.gender && item.gender.name ? item.gender : null,
    engineCapacity:
      item.engineCapacity && item.engineCapacity.name
        ? item.engineCapacity
        : null,
    mileage: item.mileage ?? null,
    address_json: item.address_json || { full: locationText },
    phone: item.user?.phone || null,
    author: item.author || null,
    year: item.year || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || undefined,
    sub_category_id: item.sub_category_id || null,
    status_id: item.status_id?.toString() || undefined,
    visibility_type: item.visibility_type?.toString() || undefined,
    group_id: item.group_id || null,
    is_approved: item.is_approved == 1 || item.is_approved === true,
  };
};

type NavProps = NativeStackNavigationProp<
  RootStackParamList,
  "ManagePostsScreen"
>;

export default function ManagePostsScreen({
  navigation,
}: {
  navigation: NavProps;
}) {
  const isFocused = useIsFocused();
  const [activeStatus, setActiveStatus] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Product[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const { unreadCount, setUnreadCount } = useNotification();
  const [searchText, setSearchText] = useState("");
  const fetchMyPosts = async (currentUserId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${path}/products/my-posts/${currentUserId}`
      );
      setAllPosts(response.data.map(mapProductData));
    } catch {
      Alert.alert("Lỗi", "Không thể tải tin đăng của bạn.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("userName");
      if (id) {
        setUserId(id);
        setUserName(name || "Người dùng");
        if (isFocused) fetchMyPosts(id);
      } else {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để xem tin.");
        navigation.goBack();
        setIsLoading(false);
      }
    };
    loadData();
  }, [isFocused]);

  useEffect(() => {
    const selectedTabName = statusTabs[activeStatus].trim(); // Bước 1: Lọc theo status (tab)

    const postsByStatus = allPosts.filter((p) => {
      if (selectedTabName === "Đã duyệt") return p.productStatus?.id === 2;
      if (selectedTabName === "Chờ duyệt")
        return p.productStatus?.id === 1 || p.productStatus == null;
      if (selectedTabName === "Từ chối") return p.productStatus?.id === 3;
      if (selectedTabName === "Đã ẩn") return p.productStatus?.id === 4;
      return false;
    }); // Bước 2: Lọc tiếp theo tên (từ kết quả Bước 1)

    if (searchText.trim() === "") {
      setFilteredPosts(postsByStatus); // Không tìm, dùng kết quả lọc status
    } else {
      const lowerCaseSearch = searchText.toLowerCase().trim();
      const postsByName = postsByStatus.filter((p) =>
        p.name.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredPosts(postsByName);
    }
  }, [activeStatus, allPosts, searchText]); // ✅ THÊM searchText VÀO ĐÂY

  const handleBellPress = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return navigation.navigate("NotificationScreen");
    try {
      await axios.patch(`${path}/notifications/user/${userId}/mark-all-read`);
      setUnreadCount(0);
    } catch {}
    navigation.navigate("NotificationScreen");
  };

  // Đây là code SỬA LẠI
  const softDeleteProduct = async (productId: string) => {
    if (!userId) {
      Alert.alert("Lỗi", "Không thể xác thực người dùng, vui lòng thử lại.");
      return;
    }

    try {
      // 1. Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem("token"); // (Giả sử bạn lưu token với key là "token")
      console.log("Token lấy từ Storage:", token);
      if (!token) {
        Alert.alert("Lỗi", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."); // Cân nhắc điều hướng về màn hình Đăng nhập
        // navigation.navigate("LoginScreen");
        return;
      } // 2. Gửi request VỚI header Authorization

      await axios.post(
        `${path}/products/${productId}/soft-delete`,
        { user_id: String(userId) }, // Body (dữ liệu)
        {
          headers: {
            // Config (chứa headers)
            Authorization: `Bearer ${token}`,
          },
        }
      ); // Cập nhật UI

      setAllPosts((prev) => prev.filter((p) => p.id !== productId));
      setFilteredPosts((prev) => prev.filter((p) => p.id !== productId));

      Alert.alert("Đã ẩn", "Sản phẩm đã được chuyển vào thùng rác.");
    } catch (err: any) {
      console.error("Lỗi khi xóa mềm:", err.message); // Bắt lỗi 401 cụ thể
      if (err.response && err.response.status === 401) {
        Alert.alert(
          "Lỗi",
          "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
        );
      } else {
        Alert.alert("Lỗi", "Không thể thực hiện. Vui lòng thử lại.");
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between h-14 px-4 bg-indigo-50 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800">
          Quản lý đăng tin
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.navigate("ChatListScreen")}
            className="mr-3"
          >
            <Ionicons name="chatbox-ellipses-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity className="relative" onPress={handleBellPress}>
            <Feather name="bell" size={22} color="#333" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center border border-white">
                <Text className="text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* Profile */}
            <View className="px-5 pt-5">
              <View className="flex-row items-center mb-5">
                <Image
                  source={require("../../assets/meo.jpg")}
                  className="w-14 h-14 rounded-full"
                />
                <View className="ml-3">
                  <Text className="text-base font-semibold text-gray-800">
                    {userName || "Người dùng"}
                  </Text>
                </View>
              </View>
            </View>
            {/* Status Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3 px-5"
            >
              {statusTabs.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setActiveStatus(index)}
                  className={`mr-3 px-4 py-2 rounded-full ${
                    index === activeStatus ? "bg-indigo-600" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      index === activeStatus ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View className="flex-row items-center bg-white rounded-lg px-4 w-full mx-2 h-12 mb-4">
              {/* Ô tìm kiếm */}
              <View className="flex-row items-center flex-1 border border-gray-200 rounded-md h-full px-3">
                <Feather name="search" size={20} color="#9ca3af" />
                <TextInput
                  placeholder="Tìm theo tên"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-3 text-base text-gray-800"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              {/* Nút thùng rác */}
              <TouchableOpacity
                onPress={() => navigation.navigate("TrashScreen")}
                className="flex-row items-center bg-red-50 px-3 py-2 rounded-md border border-red-200 ml-3 h-full"
              >
                <Feather name="trash-2" size={18} color="#dc2626" />
                <Text className="text-red-600 font-medium ml-1 text-sm">
                  Thùng rác
                </Text>
              </TouchableOpacity>
            </View>

            {/* Loading*/}
            {isLoading && (
              <ActivityIndicator
                size="large"
                color="#6366f1"
                className="mt-10"
              />
            )}
          </>
        }
        data={filteredPosts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        ListEmptyComponent={
          isLoading ? null : (
            <View className="items-center mt-10">
              <Text className="text-base font-semibold text-gray-800 mb-1">
                Không tìm thấy tin đăng
              </Text>
              <Text className="text-sm text-gray-500 text-center mb-4">
                Bạn hiện tại không có tin đăng nào cho trạng thái này
              </Text>
              <TouchableOpacity
                className="bg-amber-400 px-6 py-2 rounded-lg shadow"
                onPress={() => navigation.navigate("ChooseCategoryScreen")}
              >
                <Text className="font-semibold text-sm text-gray-800">
                  Đăng tin
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100">
            <TouchableOpacity
              className="flex-1 flex-row items-center"
              onPress={() =>
                navigation.navigate("ProductDetail", {
                  product: item,
                  isApproved: item.is_approved,
                })
              }
            >
              {/* Ảnh sản phẩm */}
              <Image
                source={{ uri: item.image }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />

              {/* Thông tin sản phẩm */}
              <View className="flex-1 ml-3">
                <Text
                  className="text-base font-semibold text-gray-800 mb-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-sm font-medium text-indigo-600">
                  {item.price}
                </Text>
              </View>
            </TouchableOpacity>
            {/* Nút chỉnh sửa và xóa */}
            <View className="flex-col space-y-2">
              {/* Nút chỉnh sửa */}
              <TouchableOpacity
                // onPress={() => navigation.navigate("EditProductScreen", { product: item })}
                className="flex-row items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg"
              >
                <Feather name="edit-2" size={18} color="#2563eb" />
                <Text className="text-blue-600 font-medium ml-1">
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>

              {/* Nút xóa */}
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Xác nhận xóa",
                    `Bạn có chắc muốn chuyển "${item.name}" vào thùng rác không?`,
                    [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Xóa",
                        style: "destructive",
                        onPress: () => softDeleteProduct(item.id),
                      },
                    ]
                  )
                }
                className="flex-row items-center bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
              >
                <Feather name="trash-2" size={18} color="#dc2626" />
                <Text className="text-red-600 font-medium ml-1">Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Menu />
    </SafeAreaView>
  );
}
