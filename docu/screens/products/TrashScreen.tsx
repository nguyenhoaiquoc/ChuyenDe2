import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Product } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../config";
import Menu from "../../components/Menu";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";

type NavProps = NativeStackNavigationProp<RootStackParamList, "TrashScreen">;

export default function TrashScreen() {
  const navigation = useNavigation<NavProps>();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [trashedProducts, setTrashedProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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

  const mapProductData = (item: any): Product => {
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
        if (addr.full) locationText = addr.full;
        else {
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

    const createdAt = item.created_at
      ? new Date(new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000)
      : new Date();
    const timeDisplay = timeSince(createdAt);

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
      price:
        item.dealType?.name === "Miễn phí"
          ? "Miễn phí"
          : item.dealType?.name === "Trao đổi"
            ? "Trao đổi"
            : item.price
              ? `${Number(item.price).toLocaleString("vi-VN")} đ`
              : "Liên hệ",
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
    };
  };

  const fetchTrashedPosts = async (currentUserId: string) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${path}/products/trash`, // 👈 Bỏ /${currentUserId}
        {
          headers: { Authorization: `Bearer ${token}` }, // 👈 Thêm Header
        }
      ); // Giả sử backend (hàm formatProducts) đã map đúng
      setTrashedProducts(response.data.map(mapProductData));
    } catch (error: any) {
      console.error("Lỗi tải tin trong thùng rác:", error.message);
      Alert.alert("Lỗi", "Không thể tải danh sách tin đã xóa.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const id = await AsyncStorage.getItem("userId");
      if (id) {
        setUserId(id);
        if (isFocused) fetchTrashedPosts(id);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy người dùng. Vui lòng đăng nhập.");
        setIsLoading(false);
      }
    };
    loadData();
  }, [isFocused]);

  const handleRestore = async (productId: string) => {
    if (!userId) return Alert.alert("Lỗi", "Không thể xác thực người dùng.");
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Không tìm thấy token");

      await axios.post(
        `${path}/products/${productId}/restore`,
        {}, // 👈 Body rỗng (backend sẽ lấy userId từ token)
        {
          headers: { Authorization: `Bearer ${token}` }, // 👈 Thêm Header
        }
      );
      setTrashedProducts((prev) => prev.filter((p) => p.id !== productId));
      Alert.alert("✅ Thành công", "Sản phẩm đã được khôi phục.");
    } catch (err: any) {
      console.error(err.message);
      Alert.alert("Lỗi", "Khôi phục thất bại, vui lòng thử lại.");
    }
  };

  const handleDeletePermanently = (productId: string) => {
    Alert.alert(
      "Xóa vĩnh viễn",
      "Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            if (!userId) return; // Đã check ở ngoài
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) throw new Error("Không tìm thấy token"); // Cú pháp axios.delete với header
              await axios.delete(`${path}/products/${productId}/hard-delete`, {
                headers: { Authorization: `Bearer ${token}` }, // 👈 Thêm Header
                // data: {} // 👈 Không cần gửi data
              });
              setTrashedProducts((prev) =>
                prev.filter((p) => p.id !== productId)
              );
              Alert.alert("🗑️ Đã xóa", "Sản phẩm đã bị xóa vĩnh viễn.");
            } catch (err: any) {
              console.error(err.message);
              Alert.alert("Lỗi", "Xóa thất bại, vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 h-14 bg-indigo-50 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800">Thùng rác</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6366f1" className="mt-10" />
      ) : trashedProducts.length === 0 ? (
        <View className="items-center mt-10">
          <Feather name="trash-2" size={40} color="#9ca3af" />
          <Text className="text-gray-600 mt-3">Thùng rác trống</Text>
        </View>
      ) : (
        <FlatList
          data={trashedProducts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100">
              <Image
                source={{ uri: item.image }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text
                  className="text-base font-semibold text-gray-800"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-sm font-medium text-indigo-600">
                  {item.price}
                </Text>
              </View>
              {/* <View className="flex-col space-y-2">
                <TouchableOpacity
                  onPress={() => handleRestore(item.id)}
                  className="bg-green-50 border border-green-200 p-2 rounded-lg"
                >
                  <Feather name="rotate-ccw" size={18} color="#16a34a" />
                  <Text>Khôi phục</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeletePermanently(item.id)}
                  className="bg-red-50 border border-red-200 p-2 rounded-lg"
                >
                  <Feather name="trash-2" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View> */}

              <View className="flex-col space-y-2">
                {/* Nút chỉnh sửa */}
                <TouchableOpacity
                  onPress={() => handleRestore(item.id)}
                  className="flex-row items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg"
                >
                  <Feather name="edit-2" size={18} color="#16a34a" />
                  <Text className="text-green-600 font-medium ml-1">
                    Khôi phục
                  </Text>
                </TouchableOpacity>

                {/* Nút xóa */}
                <TouchableOpacity
                  onPress={() => handleDeletePermanently(item.id)}
                  className="flex-row items-center bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                >
                  <Feather name="trash-2" size={18} color="#dc2626" />
                  <Text className="text-red-600 font-medium ml-1">Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Menu />
    </SafeAreaView>
  );
}
