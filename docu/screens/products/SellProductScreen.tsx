import {
  View,
  FlatList,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import ProductCard from "../../components/ProductCard";
import { Product, SellProductScreenNavigationProp } from "../../types";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { path } from "../../config";
import { Feather } from "@expo/vector-icons";

type Props = {
  navigation: SellProductScreenNavigationProp;
};

export default function SellProductScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get(`${path}/products`).then((res) => {
      const rawData = Array.isArray(res.data) ? res.data : [res.data];

      const mapped = rawData
        .filter((item: any) => item.postType?.id === "1") // 🔹 chỉ bài đăng mua
        .map((item: any) => {
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
            } catch {
              locationText = "Chưa rõ địa chỉ";
            }
          }

          // Thời gian đăng
          const createdAt = item.created_at
            ? new Date(new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000)
            : new Date();

          const timeDisplay = timeSince(createdAt);

          // Tag (category - subCategory)
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
            imageCount: item.images?.length || 1,
            isFavorite: false,
            images: item.images || [],
            description: item.description || "",
            postType: item.postType || { id: "2", name: "Đăng mua" },
            productType: item.productType || { id: "1", name: "Chưa rõ" },
            condition: item.condition || { id: "1", name: "Chưa rõ" },
            address_json: item.address_json || { full: locationText },
            dealType: item.dealType || { id: "1", name: "Bán" },
            categoryObj: item.category || {
              id: "1",
              name: categoryName || "Chưa rõ",
            },
            created_at: item.created_at || new Date().toISOString(),
          };
        });

      setProducts(mapped);
    });
  }, []);

  // --- Hàm tiện ích tính khoảng thời gian ---
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

  return (
    <View className="flex-1 px-4 mt-8">
      {/* Header ngang: icon back + tiêu đề */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 mr-2"
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Đăng bán</Text>
      </View>

      <StatusBar />

      {/* Bọc sản phẩm trong ScrollView để cuộn */}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false}
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
      </ScrollView>
    </View>
  );
}
