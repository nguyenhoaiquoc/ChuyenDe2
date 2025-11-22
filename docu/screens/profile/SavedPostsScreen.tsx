import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Product } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../config";
import Menu from "../../components/Menu";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";

type NavProps = NativeStackNavigationProp<
  RootStackParamList,
  "SavedPostsScreen"
>;

const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) {
    return seconds < 5 ? "vừa xong" : `${seconds} giây trước`;
  }
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
  // Lấy URL ảnh chính
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
      if (addr.full) {
        locationText = addr.full;
      } else {
        const parts = [addr.ward, addr.district, addr.province]
          .filter(Boolean)
          .slice(-2);
        locationText = parts.length > 0 ? parts.join(", ") : "Chưa rõ địa chỉ";
      }
    } catch (e) {
      console.log("Lỗi parse address cho product", item.id, ":", e);
      locationText = "Chưa rõ địa chỉ";
    }
  }

  // Thời gian đăng
  const createdAt = item.created_at
    ? new Date(new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000)
    : new Date();

  const timeDisplay = timeSince(createdAt);

  // Danh mục
  let tagText = "Không có danh mục";

  const categoryName = item.category?.name || null; // Tên danh mục cha
  const subCategoryName = item.subCategory?.name || null; // Tên danh mục con

  if (categoryName && subCategoryName) {
    // Trường hợp đầy đủ: Cha - Con
    tagText = `${categoryName} - ${subCategoryName}`;
  } else if (categoryName) {
    // Chỉ có tên cha
    tagText = categoryName;
  } else if (subCategoryName) {
    // Chỉ có tên con
    tagText = subCategoryName;
  }
  const authorName = item.user?.name || "Ẩn danh";

  // THAY THẾ TOÀN BỘ KHỐI 'return' TRONG HÀM .map() CỦA BẠN BẰNG CODE NÀY:

  return {
    id: item.id.toString(),
    image: imageUrl,
    name: item.name || "Không có tiêu đề",
    price: (() => {
      if (item.dealType?.name === "Miễn phí") return "Miễn phí";
      if (item.dealType?.name === "Trao đổi") return "Trao đổi";
      return item.price
        ? `${Number(item.price).toLocaleString("vi-VN")} đ`
        : "Liên hệ";
    })(),
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
    isFavorite: true,
    images: item.images || [],
    description: item.description || "",

    postType: item.postType || null,
    condition: item.condition || null,
    dealType: item.dealType || null,

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
    productStatus:
      item.productStatus && item.productStatus.name ? item.productStatus : null,
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
    group: item.group || null,
  };
};

const RenderSavedItem = ({ item, navigation, onToggleFavorite }: any) => {
  // Xử lý ảnh
  const imageUrl =
    item.thumbnail_url ||
    (item.images?.length ? item.images[0].image_url : null);
  const finalImage = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${path}${imageUrl}`
    : null;

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100 mx-4"
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      {/* Ảnh sản phẩm */}
      <Image
        source={
          finalImage ? { uri: finalImage } : require("../../assets/default.png")
        }
        className="w-20 h-20 rounded-lg bg-gray-200"
        resizeMode="cover"
      />

      {/* Thông tin */}
      <View className="flex-1 ml-3 justify-center">
        <Text
          className="text-base font-semibold text-gray-800 mb-1"
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {/* Tên nhóm / Toàn trường */}
        <View className="flex-row items-center mb-1">
          <MaterialIcons
            name={item.group ? "group" : "public"}
            size={12}
            color="#6b7280"
          />
          <Text className="text-xs text-gray-500 ml-1">
            {item.group && item.group.name ? item.group.name : "Toàn trường"}
          </Text>
        </View>

        {/* Tag danh mục */}
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="label" size={12} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>
            {item.tag || item.category?.name || "Khác"}
          </Text>
        </View>

        <Text className="text-sm font-medium text-indigo-600">
          {item.price}
        </Text>
      </View>

      {/* Nút Bỏ Lưu (Tim đỏ) */}
      <TouchableOpacity onPress={onToggleFavorite} className="p-2">
        <Ionicons name="heart" size={24} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function SavedPostsScreen() {
  const navigation = useNavigation<NavProps>();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchSavedPosts = async (currentUserId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${path}/favorites/my-list?userId=${currentUserId}`
      );

      const mappedData = response.data.map(mapProductData);
      setSavedProducts(mappedData);
    } catch (error: any) {
      console.error("Lỗi tải tin đã lưu:", error.message);
      Alert.alert("Lỗi", "Không thể tải danh sách tin đã lưu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const id = await AsyncStorage.getItem("userId");
      if (id) {
        setUserId(id);
        if (isFocused) {
          fetchSavedPosts(id);
        }
      } else {
        Alert.alert("Lỗi", "Không tìm thấy người dùng. Vui lòng đăng nhập.");
        setIsLoading(false);
      }
    };
    loadData();
  }, [isFocused]);

const handleToggleFavorite = async (productId: string) => {
    // 1. Lấy Token từ storage
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
      return;
    }

    // Optimistic Update: Xóa ngay trên giao diện cho mượt
    setSavedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );

    try {
      // 2. Gọi API với Header chứa Token
      // Lưu ý: Không cần truyền ?userId=... vì Backend tự lấy từ Token rồi
      await axios.post(
        `${path}/favorites/toggle/${productId}`,
        {}, // Body rỗng
        {
          headers: { Authorization: `Bearer ${token}` }, // 👇 QUAN TRỌNG: Phải có dòng này
        }
      );

      console.log(`Đã bỏ lưu sản phẩm ${productId}`);
    } catch (err: any) {
      console.log("Lỗi khi bỏ lưu:", err.response?.data || err.message);

      Alert.alert("Lỗi", "Bỏ lưu thất bại, vui lòng thử lại.");

      // Nếu lỗi thì tải lại danh sách để hoàn tác hành động xóa ảo lúc nãy
      const userIdStr = await AsyncStorage.getItem("userId");
      if (userIdStr && isFocused) {
        fetchSavedPosts(userIdStr);
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center mt-6 bg-white">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white mt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Tin đăng đã thích</Text>
        <View className="w-6" />
        {/* Spacer */}
      </View>

      {/* Danh sách */}
      {savedProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center bg-gray-50/50">
          <Text className="text-gray-500">Bạn chưa thích tin đăng nào.</Text>
        </View>
      ) : (
        <FlatList
          data={savedProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
          scrollEnabled={true}
          renderItem={({ item }) => (
            <RenderSavedItem
              item={item}
              navigation={navigation}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
            />
          )}
        />
      )}

      <Menu />
    </SafeAreaView>
  );
}
