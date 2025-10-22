import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Text,
  StatusBar,
  FlatList,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import ProductCard from "../../components/ProductCard";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../global.css";
import { path } from "../../config";

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

interface Product {
  id: string;
  image: any;
  name: string;
  price: string;
  phone?: string;
  location: string;
  time: string;
  tag: string;
  category: string | undefined;
  subCategory?: {
    id?: number;
    name?: string;
    source_table?: string;
    source_detail?: any;
  };
  imageCount: number;
  isFavorite: boolean;

  images?: {
    id: string;
    product_id: string;
    name: string;
    image_url: string;
    created_at: string;
  }[]; // ✅ Thêm: Full array images từ backend
  description?: string;
  condition?: { id: string; name: string };
  address_json?: { full: string };
  dealType?: { id: string; name: string };
  categoryObj?: { id: string; name: string }; // Để dùng category.name
  created_at?: string;
  author_name?: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

export default function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // ✅ HÀM LOGIC MỚI ĐỂ XỬ LÝ YÊU THÍCH
  const handleToggleFavorite = (productId: string) => {
    // 1. Cập nhật giao diện ngay lập tức (Optimistic Update)
    // Giao diện sẽ thay đổi ngay mà không cần chờ server phản hồi
    setProducts((currentProducts) =>
      currentProducts.map((p) =>
        p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
    // 2. Gọi API đến backend để cập nhật database
    // (Sau này bạn sẽ cần thêm token xác thực người dùng ở đây)
    axios
      .post(`${path}/favorites/toggle/${productId}`)
      .then((res) => {
        // Nếu thành công, log ra thông báo từ server
        console.log(`Sản phẩm ${productId}:`, res.data.message);
      })
      .catch((err) => {
        // 3. Nếu API thất bại, khôi phục lại trạng thái giao diện cũ
        console.error("Lỗi khi cập nhật yêu thích:", err.message);
        setProducts((currentProducts) =>
          currentProducts.map((p) =>
            p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
          )
        );
        alert("Thao tác thất bại, vui lòng thử lại!");
      });
  };

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
        // Đảm bảo dữ liệu là mảng
        const rawData = Array.isArray(res.data) ? res.data : [res.data];

        const mapped = rawData.map((item: any) => {
          // Lấy URL ảnh chính
          const imageUrl = (() => {
            if (!item.thumbnail_url && item.images?.length)
              return item.images[0].image_url;

            const url = item.thumbnail_url || "";
            if (url.startsWith("http")) return url; // ✅ Cloudinary hoặc CDN

            return `${path}${url}`;
          })();
          // FIX: Location dùng addr.full nếu có, fallback string an toàn
          let locationText = "Chưa rõ địa chỉ";
          if (item.address_json) {
            try {
              const addr =
                typeof item.address_json === "string"
                  ? JSON.parse(item.address_json)
                  : item.address_json;
              // Ưu tiên full nếu có, fallback join ward/district/province
              if (addr.full) {
                locationText = addr.full;
              } else {
                const parts = [addr.ward, addr.district, addr.province]
                  .filter(Boolean)
                  .slice(-2); // Chỉ 2 phần cuối để ngắn
                locationText =
                  parts.length > 0 ? parts.join(", ") : "Chưa rõ địa chỉ";
              }
            } catch (e) {
              console.log("Lỗi parse address cho product", item.id, ":", e);
              locationText = "Chưa rõ địa chỉ"; // Fallback string
            }
          }

          // Thời gian đăng (nếu có)
          const createdAt = item.created_at
            ? new Date(item.created_at)
            : new Date();

          const timeDisplay = timeSince(createdAt);

          // Danh mục
          let tagText = "Không có danh mục";

          // LƯU Ý: Đảm bảo backend đã JOIN cả Category và SubCategory vào item
          const categoryName = item.category?.name || null; // Tên danh mục cha
          const subCategoryName = item.subCategory?.name || null; // Tên danh mục con

          if (categoryName && subCategoryName) {
            // Trường hợp đầy đủ: Cha - Con
            tagText = `${categoryName} - ${subCategoryName}`;
          } else if (categoryName) {
            // Chỉ có tên cha
            tagText = categoryName;
          } else if (subCategoryName) {
            // Chỉ có tên con (ít xảy ra)
            tagText = subCategoryName;
          }

          return {
            id: item.id.toString(),
            image: imageUrl,
            name: item.name || "Không có tiêu đề",
            price: (() => {
              if (item.dealType?.name === "Miễn phí") return "Miễn phí";
              if (item.dealType?.name === "Trao đổi") return "Trao đổi";
              return item.price
                ? `${item.price.toLocaleString("vi-VN")} đ`
                : "Liên hệ";
            })(),
            location: locationText,
            time: timeDisplay,
            tag: tagText,
            category: categoryName || null,
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
            categoryChange_id: item.categoryChange_id || null,
            subCategoryChange_id: item.subCategoryChange_id || null,
            categoryChange: item.categoryChange || null,
            subCategoryChange: item.subCategoryChange || null,
            imageCount: item.images?.length || 1,
            phone: item.phone || null,
            isFavorite: item.isFavorite,
            images: item.images || [], // ✅ Thêm: Pass full array để Detail swipe
            description: item.description || "",
            condition: item.condition || { id: "1", name: "Chưa rõ" },
            address_json: item.address_json || { full: locationText },
            dealType: item.dealType || { id: "1", name: "Bán" },
            categoryObj: item.category || {
              id: "1",
              name: categoryName || "Chưa rõ",
            },
            created_at: item.created_at || new Date().toISOString(),
            author_name: item.author_name || "Người bán",
          };
        });
        setProducts(mapped);
        ``;
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

  // --- Hàm tiện ích tính toán khoảng thời gian ---
  const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

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
    if (interval >= 1) {
      return Math.floor(interval) + " phút trước";
    }
    // Mặc định cho dưới 1 phút
    return Math.floor(seconds) > 5
      ? Math.floor(seconds) + " giây trước"
      : "vừa xong";
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
        <TouchableOpacity className="p-2">
          <Feather name="bell" size={22} color="#333" />
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
                image={item.image}
                name={item.name}
                price={item.price}
                location={item.location}
                time={item.time}
                tag={item.tag}
                category={item.category}
                subCategory={item.subCategory}
                imageCount={item.imageCount}
                isFavorite={item.isFavorite}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
                onPress={() =>
                  navigation.navigate("ProductDetail", { product: item })
                }
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
