import {
  View,
  FlatList,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import ProductCard from "../../components/ProductCard";
import { Product, PurchaseRequestScreenNavigationProp } from "../../types";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { path } from "../../config";
import { Feather } from "@expo/vector-icons";

type Props = {
  navigation: PurchaseRequestScreenNavigationProp;
};

export default function PurchaseRequestScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get(`${path}/products`).then((res) => {
      const rawData = Array.isArray(res.data) ? res.data : [res.data];

      const mapped = rawData
        .filter((item: any) => item.postType?.id === "2") // 🔹 chỉ bài đăng mua
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

            // === SỬA LỖI LOGIC ===

            category: item.category || null, // Dùng null

            // Sửa logic 'subCategory' cho đúng với 'types.ts'
            subCategory: item.subCategory
              ? {
                  id: item.subCategory.id,
                  name: item.subCategory.name,
                  parent_category_id: item.subCategory.parent_category_id,
                  source_table: item.subCategory.source_table,
                  source_id: item.subCategory.source_id,
                }
              : null, // <-- SỬA TỪ 'undefined' THÀNH 'null'

            category_change: item.category_change || null, // <-- SỬA THÀNH 'null'
            sub_category_change: item.sub_category_change || null, // <-- SỬA THÀNH 'null'

            imageCount: item.images?.length || (imageUrl ? 1 : 0),
            isFavorite: false,
            images: item.images || [],
            description: item.description || "",

            // Chuẩn hóa và fallback về 'null'
            postType: item.postType || null,
            condition: item.condition || null,
            dealType: item.dealType || null,

            // Sửa logic fallback (kiểm tra .name)
            productType:
              item.productType && item.productType.name
                ? item.productType
                : null,
            origin: item.origin && item.origin.name ? item.origin : null,
            material:
              item.material && item.material.name ? item.material : null,
            size: item.size && item.size.name ? item.size : null,
            brand: item.brand && item.brand.name ? item.brand : null,
            color: item.color && item.color.name ? item.color : null,
            capacity:
              item.capacity && item.capacity.name ? item.capacity : null,
            warranty:
              item.warranty && item.warranty.name ? item.warranty : null,
            productModel:
              item.productModel && item.productModel.name
                ? item.productModel
                : null,
            processor:
              item.processor && item.processor.name ? item.processor : null,
            ramOption:
              item.ramOption && item.ramOption.name ? item.ramOption : null,
            storageType:
              item.storageType && item.storageType.name
                ? item.storageType
                : null,
            graphicsCard:
              item.graphicsCard && item.graphicsCard.name
                ? item.graphicsCard
                : null,
            breed: item.breed && item.breed.name ? item.breed : null,
            ageRange:
              item.ageRange && item.ageRange.name ? item.ageRange : null,
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
            updated_at: item.updated_at || undefined, // (optional '?' có thể là undefined)

            // Sửa fallback sang 'null'
            sub_category_id: item.sub_category_id || null,
            status_id: item.status_id?.toString() || undefined, // (optional '?' có thể là undefined)
            visibility_type: item.visibility_type?.toString() || undefined, // (optional '?' có thể là undefined)
            group_id: item.group_id || null,
            is_approved:
              typeof item.is_approved === "boolean"
                ? item.is_approved
                : undefined, // (optional '?' có thể là undefined)
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
        <Text className="text-xl font-bold">Đăng mua</Text>
      </View>

      <StatusBar />

      {/* Bọc sản phẩm trong ScrollView để cuộn */}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false} // FlatList bên trong ScrollView, FlatList tự không cuộn
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
