import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ProductType } from "../../types";
import { Feather } from "@expo/vector-icons";
import ProductCard from "../../components/ProductCard";
import Menu from "../../components/Menu";
import axios from "axios";
import { path } from "../../config";

type Props = NativeStackScreenProps<RootStackParamList, "CategoryIndex">;

const CategoryIndex: React.FC<Props> = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params ?? {};
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setError("Không có ID danh mục");
      setLoading(false);
      return;
    }

    console.log("Fetching products for categoryId:", categoryId);
    setLoading(true);
    setError(null);

    // Fetch từ backend với query param category_id
    axios
      .get(`${path}/products?category_id=${categoryId}`)
      .then((res) => {
        // Đảm bảo dữ liệu là mảng
        const rawData = Array.isArray(res.data) ? res.data : [res.data];

        // Map dữ liệu backend sang format ProductType
        // Trong useEffect fetch products ở CategoryIndex
        const mapped = rawData.map((item: any) => {
          const imageUrl = item.thumbnail_url?.startsWith("http")
            ? item.thumbnail_url
            : item.thumbnail_url
              ? `${path}${item.thumbnail_url}`
              : item.images?.[0]?.image_url
                ? `${path}${item.images[0].image_url}`
                : "https://cdn-icons-png.flaticon.com/512/8146/8146003.png";

          let locationText = "Chưa rõ địa chỉ";
          if (item.address_json) {
            try {
              const addr =
                typeof item.address_json === "string"
                  ? JSON.parse(item.address_json)
                  : item.address_json;
              locationText = addr.full
                ? addr.full
                : [addr.ward, addr.district, addr.province]
                    .filter(Boolean)
                    .slice(-2)
                    .join(", ") || "Chưa rõ địa chỉ";
            } catch (e) {
              locationText = "Chưa rõ địa chỉ";
            }
          }

          const createdAt = item.created_at
            ? new Date(new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000)
            : new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
          const timeDisplay = timeSince(createdAt);

          const categoryNameItem = item.category?.name || undefined;
          const subCategoryObj = item.subCategory
            ? {
                id: item.subCategory.id
                  ? parseInt(item.subCategory.id)
                  : undefined,
                name: item.subCategory.name,
                source_table: item.subCategory.source_table,
                source_detail: item.subCategory.source_detail,
              }
            : undefined;

          const authorName = item.user?.name || "Ẩn danh";

          // tag hiển thị
          let tagText = "Không có danh mục";
          if (categoryNameItem && subCategoryObj?.name)
            tagText = `${categoryNameItem} - ${subCategoryObj.name}`;
          else if (categoryNameItem) tagText = categoryNameItem;
          else if (subCategoryObj?.name) tagText = subCategoryObj.name;

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
            authorName: authorName,
            category: categoryNameItem,
            subCategory: subCategoryObj,
            imageCount: item.images?.length || 1,
            isFavorite: false,
            images: item.images || [],
            description: item.description || "",
          };
        });
        setProducts(mapped);
      })
      .catch((err) => {
        console.error("Lỗi fetch products:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  // Filter theo query
  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [products, query]
  );

  // Hàm tính thời gian
  const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " phút trước";
    return Math.floor(seconds) > 5
      ? Math.floor(seconds) + " giây trước"
      : "vừa xong";
  };

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-center px-4">{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-blue-500">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pt-6 pb-3 bg-slate-50">
        <TouchableOpacity
          className="p-2 rounded-lg bg-white shadow"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Quay lại"
        >
          <Feather name="chevron-left" size={22} color="#111827" />
        </TouchableOpacity>

        <View className="flex-row items-center flex-1 bg-white rounded-xl px-3 h-12 ml-3 border border-slate-200">
          <Feather name="search" size={16} color="#6b7280" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Tìm trong ${categoryName ?? "danh mục"}`}
            returnKeyType="search"
            onSubmitEditing={() => {}}
            className="ml-3 flex-1 text-sm text-slate-800 p-0"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity
              className="p-2 rounded-full bg-slate-100 ml-2"
              onPress={() => setQuery("")}
              accessibilityLabel="Xóa"
            >
              <Feather name="x" size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text className="text-lg font-semibold text-slate-800 px-4 mt-3">
        {categoryName ?? categoryId}
      </Text>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#9D7BFF" />
          <Text className="text-slate-500 mt-2">Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-8">
              <Text className="text-center text-slate-500 text-lg mb-2">
                Không tìm thấy sản phẩm
              </Text>
              <Text className="text-center text-slate-400 text-sm">
                Thử tìm kiếm khác hoặc quay lại danh mục chính
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              image={item.image}
              name={item.name}
              price={item.price}
              location={item.location}
              time={item.time}
              tag={item.tag}
              authorName={item.authorName}
              category={item.category}
              subCategory={item.subCategory}
              imageCount={item.imageCount}
              isFavorite={item.isFavorite}
              onPress={() =>
                navigation.navigate("ProductDetail", { product: item })
              }
              onToggleFavorite={() => console.log("Yêu thích:", item.name)}
            />
          )}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0">
        <Menu />
      </View>
    </View>
  );
};

export default CategoryIndex;
