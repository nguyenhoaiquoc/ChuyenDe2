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

          // return {
          //   id: item.id.toString(),
          //   image: imageUrl,
          //   name: item.name || "Không có tiêu đề",
          //   price: (() => {
          //     if (item.dealType?.name === "Miễn phí") return "Miễn phí";
          //     if (item.dealType?.name === "Trao đổi") return "Trao đổi";
          //     return item.price
          //       ? `${item.price.toLocaleString("vi-VN")} đ`
          //       : "Liên hệ";
          //   })(),
          //   location: locationText,
          //   time: timeDisplay,
          //   tag: tagText,
          //   authorName: item.user?.name || "Ẩn danh",
          //   category: item.category,
          //   subCategory: item.subCategory
          //     ? {
          //       id: item.subCategory.id
          //         ? parseInt(item.subCategory.id)
          //         : undefined,
          //       name: item.subCategory.name,
          //       source_table: item.subCategory.source_table,
          //       source_detail: item.subCategory.source_detail,
          //     }
          //     : undefined,
          //   imageCount: item.images?.length || 1,
          //   isFavorite: false,
          //   images: item.images || [],
          //   description: item.description || "",
          //   postType: item.postType || { id: "2", name: "Đăng mua" },
          //   productType: item.productType || { id: "1", name: "Chưa rõ" },
          //   condition: item.condition || { id: "1", name: "Chưa rõ" },
          //   address_json: item.address_json || { full: locationText },
          //   dealType: item.dealType || { id: "1", name: "Bán" },
          //   created_at: item.created_at || new Date().toISOString(),
          //   user_id: item.user_id ?? 0,
          //   author: item.author,
          //   year: item.year
          // };
          // THAY THẾ TOÀN BỘ KHỐI 'return {...};' BÊN TRONG HÀM .map() BẰNG CODE NÀY

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
