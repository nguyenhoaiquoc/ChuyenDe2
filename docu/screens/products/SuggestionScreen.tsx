import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView, // 👈 Dùng ScrollView
  SafeAreaView,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  RootStackParamList,
  Product,
  SubCategory,
  Category, // 👈 Thêm Category
} from "../../types"; // Import type của bạn
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../../components/ProductCard";
import { useNavigation } from "@react-navigation/native";

// Kiểu dữ liệu cho API feed (Giả sử Backend trả về thế này)
type SuggestionFeedItem = {
  subCategory: { id: number; name: string };
  sellingSuggestions: Product[]; // Gợi ý người Cần Mua (postType: 2)
  buyingSuggestions: Product[]; // Gợi ý người Đang Bán (postType: 1)
};

type SuggestionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SuggestionScreen"
>;

type Props = {
  navigation: SuggestionScreenNavigationProp;
};

// 1. API Backend mới (Dựa trên ý tưởng trước)
// Bạn CẦN VIẾT API NÀY ở Backend nhé!
const fetchSuggestionFeed = async () => {
  const token = await AsyncStorage.getItem("token");
  console.log("Token lấy từ AsyncStorage:", token);
  if (!token) throw new Error("Chưa đăng nhập");

  // API này sẽ tự phân tích user và trả về mảng SuggestionFeedItem[]
  const res = await axios.get(`${path}/products/suggestions/my-feed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export default function SuggestionScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState("sell"); // 'sell' (Bán) hoặc 'buy' (Mua)
  const [feedData, setFeedData] = useState<SuggestionFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const fetchFavorites = async () => {
    try {
      const userIdStr = await AsyncStorage.getItem("userId");
      if (!userIdStr) return; // Không cần làm gì nếu chưa đăng nhập
      const userId = parseInt(userIdStr, 10);
      const res = await axios.get(`${path}/favorites/user/${userId}`);
      setFavoriteIds(res.data.productIds || []);
    } catch (err) {
      console.log("Lỗi khi lấy danh sách yêu thích (SuggestionScreen):", err);
      // Không cần throw err ở đây để tránh làm dừng các tác vụ khác
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    try {
      const userIdStr = await AsyncStorage.getItem("userId");
      if (!userIdStr) {
        Alert.alert("Thông báo", "Vui lòng đăng nhập để yêu thích sản phẩm.");
        return;
      }
      const userId = parseInt(userIdStr, 10);
      // Gọi API để toggle
      await axios.post(`${path}/favorites/toggle/${productId}`, { userId });

      setFavoriteIds((prevIds) => {
        if (prevIds.includes(productId)) {
          return prevIds.filter((id) => id !== productId);
        } else {
          return [...prevIds, productId];
        }
      });
    } catch (err) {
      console.log("Lỗi toggle yêu thích (SuggestionScreen):", err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [feedResult] = await Promise.all([
          fetchSuggestionFeed(),
          fetchFavorites(),
        ]);

        // BƯỚC XỬ LÝ DỮ LIỆU
        const mappedFeedData = feedResult.map(
          (feedItem: SuggestionFeedItem) => ({
            ...feedItem,
            // Dùng mapProductData để xử lý từng sản phẩm trong mảng
            sellingSuggestions: feedItem.sellingSuggestions.map(mapProductData),
            buyingSuggestions: feedItem.buyingSuggestions.map(mapProductData),
          })
        );

        setFeedData(mappedFeedData);
      } catch (err: any) {
        console.error("Lỗi lấy feed gợi ý:", err.message);
        Alert.alert("Lỗi", "Không thể tải gợi ý. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- Hàm tiện ích tính toán khoảng thời gian ---
  const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    // Nếu khoảng thời gian < 60 giây, trả về "Vừa đăng" (hoặc "vài giây trước")
    if (seconds < 60) {
      return seconds < 5 ? "vừa xong" : `${seconds} giây trước`;
    }

    let interval = seconds / 31536000;
    if (interval >= 1) {
      return Math.floor(interval) + " năm trước";
    }
    interval = seconds / 2592000;
    if (interval >= 1) {
      return Math.floor(interval) + " tháng trước";
    }
    interval = seconds / 86400;
    if (interval >= 1) {
      return Math.floor(interval) + " ngày trước";
    }
    interval = seconds / 3600;
    if (interval >= 1) {
      return Math.floor(interval) + " giờ trước";
    }
    interval = seconds / 60;
    return Math.floor(interval) + " phút trước";
  };

  const mapProductData = (item: any): Product => {
    // 🔹 Xử lý ảnh
    const imageUrl = (() => {
      if (!item.thumbnail_url && item.images?.length)
        return item.images[0].image_url;

      const url = item.thumbnail_url || "";
      if (url.startsWith("http")) return url;

      return `${path}${url}`;
    })();

    // 🔹 Xử lý địa chỉ
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
          locationText =
            parts.length > 0 ? parts.join(", ") : "Chưa rõ địa chỉ";
        }
      } catch (e) {
        console.log("Lỗi parse address cho product", item.id, ":", e);
        locationText = "Chưa rõ địa chỉ";
      }
    }

    // 🔹 Xử lý thời gian
    const createdAt = item.created_at
      ? new Date(new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000)
      : new Date();
    const timeDisplay = timeSince(createdAt);

    // Danh mục
    let tagText = "Không có danh mục";
    const categoryName = item.category?.name || null;
    const subCategoryName = item.subCategory?.name || null;
    if (categoryName && subCategoryName)
      tagText = `${categoryName} - ${subCategoryName}`;
    else if (categoryName) tagText = categoryName;
    else if (subCategoryName) tagText = subCategoryName;

    // 🔹 Xử lý Giá (QUAN TRỌNG)
    const priceDisplay = (() => {
      if (item.dealType?.name === "Miễn phí") return "Miễn phí";
      if (item.dealType?.name === "Trao đổi") return "Trao đổi";
      return item.price
        ? `${Number(item.price).toLocaleString("vi-VN")} đ`
        : "Liên hệ";
    })();

    const authorNameDisplay =
      item.user?.fullName || item.user?.name || "Ẩn danh";

    return {
      id: item.id.toString(),
      image: imageUrl,
      name: item.name || "Không có tiêu đề",
      price: priceDisplay,
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
      mileage: item.mileage || null,

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
    };
  };

  // 2. HÀM RENDER MỘT KHỐI (ĐÃ SỬA ĐỔI)
  // `item` ở đây là SugestionFeedItem
  const renderSuggestionSection = (item: SuggestionFeedItem) => {
    // Quyết định lấy list nào dựa trên tab
    const dataList =
      activeTab === "sell"
        ? item.sellingSuggestions // Tab "Gợi ý bán" -> Hiện người Cần Mua
        : item.buyingSuggestions; // Tab "Gợi ý mua" -> Hiện người Đang Bán

    if (dataList.length === 0) return null; // Ẩn nếu không có gợi ý

    return (
      <View key={item.subCategory.id} className="mb-6">
        {/* Tiêu đề danh mục con */}
        <Text className="text-xl font-bold text-gray-800 px-4 mb-3">
          {item.subCategory.name}
        </Text>

        <View className="px-4">
          <FlatList
            data={dataList}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            keyExtractor={(product) => product.id.toString()}
            renderItem={({ item: product }) => (
              <ProductCard
                product={product}
                onPress={() =>
                  navigation.navigate("ProductDetail", { product: product })
                }
                isFavorite={favoriteIds.includes(String(product.id))}
                onToggleFavorite={() => handleToggleFavorite(product.id)}
                onPressPostType={(pt) => {
                  if (pt.id == "1") navigation.navigate("SellProductScreen");
                  else if (pt.id == "2")
                    navigation.navigate("PurchaseRequestScreen");
                }}
              />
            )}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-4">Gợi ý dành cho bạn</Text>
      </View>

      {/* 4. THANH TABS (BÁN / MUA) */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => setActiveTab("sell")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "sell" ? "border-blue-500" : "border-gray-300"
          }`}
        >
          <Text
            className={`font-bold ${
              activeTab === "sell" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            Gợi ý Bán (Tìm người Mua)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("buy")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "buy" ? "border-blue-500" : "border-gray-300"
          }`}
        >
          <Text
            className={`font-bold ${
              activeTab === "buy" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            Gợi ý Mua (Tìm người Bán)
          </Text>
        </TouchableOpacity>
      </View>

      {/* 5. DANH SÁCH GỢI Ý (DÙNG SCROLLVIEW) */}
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" className="mt-20" />
      ) : (
        <ScrollView className="flex-1 mt-4">
          {feedData.length > 0 ? (
            feedData.map(renderSuggestionSection) // 👈 `feedData` (SuggestionFeedItem[]) được map ở đây
          ) : (
            <Text className="text-center text-gray-500 mt-20 px-4">
              Bạn chưa đăng tin nào, hãy đăng tin để chúng tôi cá nhân hoá gợi ý
              cho bạn nhé!
            </Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
