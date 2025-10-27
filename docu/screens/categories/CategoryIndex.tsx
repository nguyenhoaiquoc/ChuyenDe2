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
import { Product, RootStackParamList } from "../../types";
import { Feather } from "@expo/vector-icons";
import ProductCard from "../../components/ProductCard";
import Menu from "../../components/Menu";
import axios from "axios";
import { path } from "../../config";

type Props = NativeStackScreenProps<RootStackParamList, "CategoryIndex">;

const CategoryIndex: React.FC<Props> = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params ?? {};
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (interval >= 1) return Math.floor(interval) + " phút trước";
    return Math.floor(seconds) > 5
      ? Math.floor(seconds) + " giây trước"
      : "vừa xong";
  };

  useEffect(() => {
    if (!categoryId) {
      setError("Không có ID danh mục");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    axios
      .get(`${path}/products?category_id=${categoryId}`)
      .then((res) => {
        const rawData = Array.isArray(res.data) ? res.data : [res.data];

        const mapped: Product[] = rawData.map((item: any) => {
          console.log("CategoryIndex productType:", item.productType);
          // URL ảnh
          const imageUrl = item.thumbnail_url?.startsWith("http")
            ? item.thumbnail_url
            : item.thumbnail_url
              ? `${path}${item.thumbnail_url}`
              : item.images?.[0]?.image_url
                ? `${path}${item.images[0].image_url}`
                : "https://cdn-icons-png.flaticon.com/512/8146/8146003.png";

          // Địa chỉ
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
            } catch {
              locationText = "Chưa rõ địa chỉ";
            }
          }

          // Thời gian
          const createdAt = item.created_at
            ? new Date(new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000)
            : new Date();
          const timeDisplay = timeSince(createdAt);

          // Tag
          const categoryNameItem = item.category?.name || null;
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
            authorName: item.user?.name || "Ẩn danh",
            user_id: item.user?.id ?? item.user_id ?? 0,
            category: categoryName,
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
            category_change: item.category_change
              ? {
                  id: item.category_change.id,
                  name: item.category_change.name,
                  image: item.category_change.image,
                }
              : undefined,
            sub_category_change: item.sub_category_change
              ? {
                  id: item.sub_category_change.id,
                  name: item.sub_category_change.name,
                  parent_category_id:
                    item.sub_category_change.parent_category_id || null,
                  source_table: item.sub_category_change.source_table || null,
                }
              : undefined,
            imageCount: item.images?.length || 1,
            isFavorite: false,
            images: item.images || [],
            description: item.description || "",
            postType:
              item.postType && item.postType.id
                ? item.postType
                : { id: "2", name: "Đăng mua" },

            productType: item.productType || { id: "1", name: "Chưa rõ" },

            condition:
              item.condition && item.condition.id
                ? item.condition
                : { id: "1", name: "Chưa rõ" },

            dealType:
              item.dealType && item.dealType.name
                ? item.dealType
                : { id: "1", name: "Bán" },

            address_json: item.address_json || { full: locationText },
            categoryObj: item.category || {
              id: "1",
              name: categoryName || "Chưa rõ",
            },
            created_at: item.created_at || new Date().toISOString(),
            
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

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [products, query]
  );

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
            className="ml-3 flex-1 text-sm text-slate-800 p-0"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity
              className="p-2 rounded-full bg-slate-100 ml-2"
              onPress={() => setQuery("")}
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
              product={item}
              onPress={() =>
                navigation.navigate("ProductDetail", { product: item })
              }
              onToggleFavorite={() => console.log("Yêu thích:", item.name)}
              onPressPostType={(pt) => {
                if (pt.id == "1") navigation.navigate("SellProductScreen");
                else if (pt.id == "2")
                  navigation.navigate("PurchaseRequestScreen");
              }}
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
