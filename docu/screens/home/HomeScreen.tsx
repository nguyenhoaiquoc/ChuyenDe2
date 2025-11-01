import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Text,
  StatusBar,
  FlatList,
  GestureResponderEvent,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Category, Product, RootStackParamList } from "../../types";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import ProductCard from "../../components/ProductCard";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../global.css";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNotification } from "../Notification/NotificationContext";
import { useIsFocused } from '@react-navigation/native';


type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const filters = [
  { id: "1", label: "Dành cho bạn" },
  { id: "2", label: "Đang tìm mua" },
  { id: "3", label: "Mới nhất" },
  { id: "4", label: "Đồ miễn phí" },
  { id: "5", label: "Trao đổi" },
  { id: "6", label: "Gợi ý cho bạn " },
];

export default function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const isFocused = useIsFocused();
  const { unreadCount, setUnreadCount, fetchUnreadCount } = useNotification();

  useEffect(() => {
    axios
      .get(`${path}/categories`)
      .then((res) => {
        const mapped = res.data.map((item: Category) => ({
          id: item.id.toString(),
          name: item.name,
          image: item.image
            ? item.image.startsWith("/uploads")
              ? `${path}${item.image}`
              : `${path}/uploads/categories/${item.image}`
            : `${path}/uploads/categories/default.png`,
        }));
        setCategories(mapped);
      })
      .catch((err) => console.log("Lỗi khi lấy danh mục:", err.message));
  }, []);

  useEffect(() => {
    axios
      .get(`${path}/products`)
      .then((res) => {
        // dữ liệu là mảng
        const rawData = Array.isArray(res.data) ? res.data : [res.data];

        const mapped = rawData.map((item: any) => {
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

          return {
            id: item.id.toString(),
            image: imageUrl, // Sử dụng imageUrl đã xử lý
            name: item.name || "Không có tiêu đề",
            price: (() => {
              // Logic giá của bạn đã đúng
              if (item.dealType?.name === "Miễn phí") return "Miễn phí";
              if (item.dealType?.name === "Trao đổi") return "Trao đổi";
              return item.price
                ? `${Number(item.price).toLocaleString("vi-VN")} đ` // Ép kiểu Number để toLocaleString
                : "Liên hệ";
            })(),
            location: locationText, // Sử dụng locationText đã xử lý
            time: timeDisplay, // Sử dụng timeDisplay đã xử lý
            tag: tagText, // Sử dụng tagText đã xử lý
            authorName: item.user?.fullName || item.user?.name || "Ẩn danh", // Ưu tiên fullName
            user_id: item.user?.id ?? item.user_id ?? 0, // ===== SỬA LỖI 1: category =====
            // Gán trực tiếp object 'category' từ API

            category: item.category, // <-- Gán object category
            // Giữ nguyên logic subCategory của bạn (đã ổn)

            subCategory: item.subCategory
              ? {
                id: item.subCategory.id
                  ? parseInt(item.subCategory.id)
                  : undefined,
                name: item.subCategory.name,
                source_table: item.subCategory.source_table,
                source_detail: item.subCategory.source_detail,
              }
              : undefined,
            // Giữ nguyên category_change và sub_category_change
            category_change: item.category_change || undefined,
            sub_category_change: item.sub_category_change || undefined,

            imageCount: item.images?.length || (imageUrl ? 1 : 0), // Đếm ảnh hoặc dựa vào imageUrl
            isFavorite: false, // Mặc định là false
            images: item.images || [], // Gán mảng images
            description: item.description || "",

            // Chuẩn hóa các object liên quan (PostType, ProductType, Condition, DealType)
            postType: item.postType || { id: "1", name: "Chưa rõ" }, // Cung cấp giá trị mặc định nếu thiếu
            productType: item.productType || { id: "1", name: "Chưa rõ" },
            condition: item.condition || { id: "1", name: "Chưa rõ" },
            dealType: item.dealType || { id: "1", name: "Bán" },

            address_json: item.address_json || { full: locationText }, // Gán object address_json
            phone: item.user?.phone || null, // Lấy phone từ user nếu có
            // ===== SỬA LỖI 2: year =====

            // (XÓA DÒNG 'categoryObj' bị thừa)

            author: item.author || null, // Gán author
            year: item.year || null, // Gán year (sửa lỗi copy-paste)

            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || undefined, // Thêm updated_at

            // Đảm bảo các trường còn lại của Product type cũng có mặt (nếu API trả về)
            sub_category_id: item.sub_category_id || null,
            status_id: item.status_id?.toString() || undefined,
            visibility_type: item.visibility_type?.toString() || undefined,
            group_id: item.group_id || null,
            is_approved:
              typeof item.is_approved === "boolean"
                ? item.is_approved
                : undefined,
            // 'file' không cần map ở đây vì nó không đến từ API get products
          };
        });
        setProducts(mapped);
      })
      .catch((err) => {
        if (err.response) {
          console.log("Lỗi từ server:", err.response.data);
        } else if (err.request) {
          console.log("Không nhận được phản hồi từ server:", err.request);
        } else {
          console.log("Lỗi khi gọi API:", err.message);
        }
      });
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userIdStr = await AsyncStorage.getItem("userId");
        if (!userIdStr) return;
        const userId = parseInt(userIdStr, 10);
        const res = await axios.get(`${path}/favorites/user/${userId}`);
        setFavoriteIds(res.data.productIds || []);
      } catch (err) {
        console.log("Lỗi khi lấy danh sách yêu thích:", err);
      }
    };

    fetchFavorites(); // gọi hàm async
  }, []);
  
  useEffect(() => {
    if (isFocused) {
      console.log("HomeScreen đang focus, gọi fetchUnreadCount...");
      fetchUnreadCount(); // Gọi API lấy số lượng
    }
  }, [isFocused, fetchUnreadCount]); // Chạy lại khi isFocused

  const handleToggleFavorite = async (productId: string) => {
    try {
      const userIdStr = await AsyncStorage.getItem("userId");
      if (!userIdStr) return; // nếu null thì bỏ qua
      const userId = parseInt(userIdStr, 10);
      await axios.post(`${path}/favorites/toggle/${productId}`, { userId });
      const res = await axios.get(`${path}/favorites/user/${userId}`);
      setFavoriteIds(res.data.productIds || []);
    } catch (err) {
      console.log("Lỗi toggle yêu thích screen:", err);
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
  return (
    <View className="flex-1 bg-[#f5f6fa] mt-6">
      <StatusBar className="auto" />

      {/* Header */}
      <View className="flex-row items-center px-3 py-2 bg-white shadow z-10">
        {/* Icon menu */}
        <TouchableOpacity className="p-2">
          <Feather name="menu" size={24} color="#333" />
        </TouchableOpacity>

        {/* Thanh tìm kiếm */}
        <View className="flex-1 mx-2">
          <TextInput
            placeholder="Tìm kiếm sản phẩm..."
            className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700"
          />
        </View>

        {/* Icon trái tim */}
        <TouchableOpacity className="p-2">
          <FontAwesome name="heart-o" size={22} color="#333" />
        </TouchableOpacity>

        {/* Icon chuông */}
        <TouchableOpacity
          className="p-2 relative"
          onPress={handleBellPress}
        >
          <Feather name="bell" size={22} color="#333" />

          {/* 3. Thêm cái badge (chấm đỏ) */}
          {unreadCount > 0 && (
            <View className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center border border-white">
              <Text className="text-white text-[10px] font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Banner */}
        <View className="bg-white">
          <View className="flex-row items-center px-4 py-4">
            {/* Text bên trái */}
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-gray-800">
                Mua bán & Trao đổi đồ cũ TDC
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
                // Navigate sang CategoryIndex với categoryId (danh mục cha) để fetch sản phẩm theo cha
                navigation.navigate("CategoryIndex", {
                  categoryId: item.id.toString(), // ID danh mục cha để filter products
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
                className={`px-4 py-2 mr-3 rounded-full border ${selectedFilter === item.label
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-gray-300"
                  }`}
                onPress={() => {
                  console.log("Chọn bộ lọc:", item.label);
                  setSelectedFilter(item.label);

                  if (item.label === "Đồ miễn phí") {
                    setFilteredProducts(
                      products.filter((p) => p.price === "Miễn phí")
                    );
                  } else if (item.label === "Trao đổi") {
                    setFilteredProducts(
                      products.filter((p) => p.price === "Trao đổi")
                    );
                  } else if (item.label == "Đang tìm mua") {
                    setFilteredProducts(
                      products.filter((p) => p.postType?.id == "2")
                    );
                  } else {
                    setFilteredProducts(products); // các filter khác hiển thị tất cả
                  }
                }}
              >
                <Text
                  className={`${selectedFilter === item.label ? "text-white" : "text-gray-700"} text-sm`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {/* Danh sách sản phẩm */}
        <View className="px-4 mt-4">
          <FlatList
            data={selectedFilter ? filteredProducts : products} // 🔹
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingBottom: 80 }}
            scrollEnabled={false}
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
        </View>
      </ScrollView>
      {/* Menu dưới */}
      <Menu />
    </View>
  );
}