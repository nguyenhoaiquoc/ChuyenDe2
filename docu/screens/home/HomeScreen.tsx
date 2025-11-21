import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Text,
  StatusBar,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Category, Product, RootStackParamList } from "../../types";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import ProductCard from "../../components/ProductCard";
import SearchProduct from "../products/SearchProduct";
import { useEffect, useState, useCallback } from "react"; // 2. Thêm useCallback
import axios from "axios";
import "../../global.css";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotification } from "../Notification/NotificationContext";
import React from "react";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const filters = [
  { id: "1", label: "Mới nhất" },
  { id: "2", label: "Gợi ý cho bạn", type: "navigate" },
  { id: "3", label: "Đồ miễn phí" },
  { id: "4", label: "Trao đổi" },
];

export default function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("Mới nhất");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const { unreadCount, setUnreadCount, fetchUnreadCount } = useNotification();

  const fetchCategories = () => {
    return axios
      .get(`${path}/categories`)
      .then((res) => {
        const mapped = res.data.map((item: Category) => ({
          id: item.id.toString(),
          name: item.name,
          image: item.image
            ? item.image.startsWith("http")
              ? item.image
              : `${path}${item.image.startsWith("/") ? "" : "/uploads/categories/"}${item.image}`
            : `${path}/uploads/categories/default.png`,
        }));
        setCategories(mapped);
      })
      .catch((err) => {
        console.log("Lỗi khi lấy danh mục:", err.message);
        throw err;
      });
  };

  const fetchProducts = async (filterType?: string): Promise<void> => {
    try {
      let url = `${path}/products`; // mặc định: tất cả sản phẩm

      if (filterType === "Miễn phí") {
        url = `${path}/products/free`; // API lấy đồ miễn phí
      } else if (filterType === "Trao đổi") {
        url = `${path}/products/exchange`; // API lấy đồ trao đổi
      }

      console.log("Fetching URL:", url);

      // 🔹 Gọi API
      const res = await axios.get(url);
      const rawData = Array.isArray(res.data) ? res.data : [res.data];

      // 🔹 Xử lý dữ liệu
      const mapped = rawData.map((item) => {
        // Lấy URL ảnh chính
        const imageUrl = (() => {
          if (!item.thumbnail_url && item.images?.length)
            return item.images[0].image_url;

          const url = item.thumbnail_url || "";
          if (url.startsWith("http")) return url;

          return `${path}${url}`;
        })();

        // Xử lý địa chỉ
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

        // Thời gian đăng
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

        // 🟢 Trả về đầy đủ dữ liệu sản phẩm
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
            item.productModel && item.productModel.name
              ? item.productModel
              : null,
          processor:
            item.processor && item.processor.name ? item.processor : null,
          ramOption:
            item.ramOption && item.ramOption.name ? item.ramOption : null,
          storageType:
            item.storageType && item.storageType.name ? item.storageType : null,
          graphicsCard:
            item.graphicsCard && item.graphicsCard.name
              ? item.graphicsCard
              : null,
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
      });

      setProducts(mapped);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.log("Lỗi từ server:", err.response.data);
        } else if (err.request) {
          console.log("Không nhận được phản hồi từ server:", err.request);
        } else {
          console.log("Lỗi khi gọi API:", err.message);
        }
      } else {
        console.error("Lỗi không xác định:", err);
      }
    }
  };
  useEffect(() => {
    const loadProducts = async () => {
      // 1. Bắt đầu loading
      setIsLoading(true);
      //  Xóa list cũ để màn hình trống sạch sẽ trước khi hiện cái mới
      setProducts([]);

      try {
        let apiFilter: string | undefined;
        if (selectedFilter === "Đồ miễn phí") apiFilter = "Miễn phí";
        else if (selectedFilter === "Trao đổi") apiFilter = "Trao đổi";

        // Gọi hàm fetch có sẵn của bạn
        await fetchProducts(apiFilter);
      } catch (error) {
        console.log("Lỗi load tab:", error);
      } finally {
        // 2. Kết thúc loading dù thành công hay thất bại
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [selectedFilter]);

  const fetchFavorites = async () => {
    try {
      const userIdStr = await AsyncStorage.getItem("userId");
      if (!userIdStr) return;
      const userId = parseInt(userIdStr, 10);
      const res = await axios.get(`${path}/favorites/user/${userId}`);
      setFavoriteIds(res.data.productIds || []);
    } catch (err) {
      console.log("Lỗi khi lấy danh sách yêu thích:", err);
      throw err;
    }
  };

  // Gọi các hàm fetch khi component mount lần đầu
  useEffect(() => {
    fetchCategories();
    fetchFavorites();
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleToggleFavorite = async (productId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Thông báo", "Vui lòng đăng nhập để yêu thích sản phẩm.");
        return;
      }

      // Gửi token để BE tự nhận diện user
      await axios.post(
        `${path}/favorites/toggle/${productId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Sau khi toggle, lấy lại danh sách favorites
      const userIdStr = await AsyncStorage.getItem("userId");
      if (userIdStr) {
        const res = await axios.get(
          `${path}/favorites/user/${parseInt(userIdStr, 10)}`
        );
        setFavoriteIds(res.data.productIds || []);
      }
    } catch (err: any) {
      console.log("Lỗi toggle yêu thích:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        Alert.alert("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại.");
      }
    }
  };

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

  const handleBellPress = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      return navigation.navigate("NotificationScreen");
    }
    try {
      await axios.patch(`${path}/notifications/user/${userId}/mark-all-read`);
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi khi mark all as read:", error);
    } finally {
      navigation.navigate("NotificationScreen");
    }
  };

  useEffect(() => {
    const check = async () => {
      const data = await AsyncStorage.getItem("JOIN_GROUP_SUCCESS");
      if (data) {
        const { groupName } = JSON.parse(data);
        Alert.alert(
          "BẠN ĐÃ THAM GIA NHÓM!",
          `Chào mừng bạn đến với ${groupName}!`,
          [
            {
              text: "OK",
              onPress: () => AsyncStorage.removeItem("JOIN_GROUP_SUCCESS"),
            },
          ]
        );
      }
    };
    check();
  }, []);

  // 5. Tạo hàm onRefresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Gọi song song các hàm fetch
      await Promise.all([
        fetchCategories(),
        fetchProducts(selectedFilter),
        fetchFavorites(),
        fetchUnreadCount(),
      ]);
    } catch (error) {
      console.error("Lỗi khi làm mới:", error);
      Alert.alert("Lỗi", "Không thể tải lại dữ liệu. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  }, [selectedFilter, fetchUnreadCount]); // fetchUnreadCount là dependency ổn định từ context

  return (
    <View className="flex-1 bg-[#f5f6fa] mt-8">
      <StatusBar hidden={true} />

      {/* Header */}
      <View className="flex-row items-center px-3 py-2 bg-white shadow z-10">
        {/* Icon menu */}
        <TouchableOpacity className="p-2">
          <Feather name="menu" size={24} color="#333" />
        </TouchableOpacity>

        {/* Thanh tìm kiếm */}
        <TouchableOpacity
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 justify-center"
          onPress={() => navigation.navigate("SearchProduct")}
        >
          <Text className="text-gray-500 text-sm">Tìm kiếm sản phẩm...</Text>
        </TouchableOpacity>

        {/* Icon trái tim */}
        <TouchableOpacity className="p-2">
          <FontAwesome name="heart-o" size={22} color="#333" />
        </TouchableOpacity>

        {/* Icon chuông */}
        <TouchableOpacity className="p-2 relative" onPress={handleBellPress}>
          <Feather name="bell" size={22} color="#333" />

          {/* 3. Thêm cái badge (chấm đỏ) */}
          {unreadCount > 0 && (
            <View className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center border border-white">
              <Text className="text-white text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 6. Thêm prop `refreshControl` vào ScrollView */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner */}
        <View className="bg-white">
          <View className="flex-row items-center px-4 py-4">
            {/* Text bên trái */}
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-gray-800">
                Hỗ trợ Mua bán & Trao đổi đồ cũ TDC
              </Text>
            </View>

            {/* Hình bên phải */}
            <Image
              source={require("../../assets/banner.png")}
              className="w-40 h-40 rounded-lg"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Tiêu đề danh mục */}
        <View className="flex-row justify-between items-center px-4 mt-6 mb-2">
          <Text className="text-base font-semibold text-gray-800">
            Khám phá danh mục
          </Text>
        </View>

        {/* Danh mục vuốt ngang */}
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="w-20 items-center mr-4 bg-white rounded-lg p-2 shadow-sm"
              onPress={() => {
                navigation.navigate("CategoryIndex", {
                  categoryId: item.id.toString(),
                  categoryName: item.name,
                });
              }}
            >
              <Image
                source={{ uri: item.image }}
                className="w-8 h-8 mb-2"
                resizeMode="contain"
              />
              <Text
                className="text-[12px] text-gray-800 text-center leading-tight"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ width: "100%" }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
        <View className="px-4">
          <FlatList
            data={filters}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`px-4 py-2 mr-3 rounded-full border ${
                  selectedFilter === item.label
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white border-gray-300"
                }`}
                onPress={() => {
                  if (item.type === "navigate") {
                    navigation.navigate("SuggestionScreen");
                  } else {
                    setSelectedFilter(item.label);
                  }
                }}
              >
                <Text
                  className={`${
                    selectedFilter === item.label
                      ? "text-white"
                      : "text-gray-700"
                  } text-sm`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {/* Danh sách sản phẩm */}
        <View className="px-4 mt-4">
          {isLoading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-400 mt-2 text-sm">
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : (
            /* 👇 Nếu không load thì hiện FlatList như cũ */
            <FlatList
              data={products.filter((p) => p.productStatus?.id === 2)}
              numColumns={2}
              keyExtractor={(item) => item.id}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              contentContainerStyle={{ paddingBottom: 80 }}
              scrollEnabled={false}
              ListEmptyComponent={
                // Thêm dòng này để báo nếu không có sản phẩm nào
                <Text className="text-center text-gray-500 mt-10">
                  Không tìm thấy sản phẩm nào.
                </Text>
              }
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  isFavorite={favoriteIds.includes(String(item.id))}
                  onToggleFavorite={() => handleToggleFavorite(item.id)}
                  onPress={() =>
                    navigation.navigate("ProductDetail", { product: item })
                  }
                  onPressPostType={(pt) => {
                    if (pt.id == "1") navigation.navigate("SellProductScreen");
                    else if (pt.id == "2")
                      navigation.navigate("PurchaseRequestScreen");
                  }}
                />
              )}
            />
          )}
        </View>
      </ScrollView>
      {/* Menu dưới */}
      <Menu />
    </View>
  );
}
