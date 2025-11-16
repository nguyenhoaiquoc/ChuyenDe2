import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../config";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Giả định cấu trúc Product cho FlatList
interface Product {
  id: string;
  name: string;
  price: string;
  thumbnail_url?: string;
  // Thêm các trường khác cần thiết
}

export default function SavePostScreen({ navigation }: { navigation: any }) {
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<number | null>(null);

  // 1. Lấy userId từ AsyncStorage khi component mount
  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setCurrentUser(id ? Number(id) : null);
      // Giữ loading = true cho đến khi fetchFavorites được gọi
    };
    getUserId();
  }, []);

  // 2. Hàm gọi API để lấy danh sách ID sản phẩm đã lưu
  const fetchFavoriteIds = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      setSavedProducts([]);
      return;
    }

    setLoading(true);
    try {
      // ✅ CẬP NHẬT ENDPOINT: SỬ DỤNG ROUTE MỚI /favorites/by-user/:userId
      const response = await axios.get(`${path}/favorites/by-user/${currentUser}`);
      
      // Giả sử response.data là MẢNG CÁC ID SẢN PHẨM (number[] hoặc string[])
      const productIds: string[] = response.data.map((id: number | string) => id.toString());

      if (productIds.length === 0) {
        setSavedProducts([]);
        setLoading(false);
        return;
      }
      
      // ⚠️ BƯỚC QUAN TRỌNG: Gọi API để lấy chi tiết từng sản phẩm
      // Vì controller của bạn chỉ trả về ID, chúng ta cần fetch chi tiết
      const productDetailsPromises = productIds.map(id => 
        axios.get<Product>(`${path}/products/${id}`)
      );

      const productResponses = await Promise.all(productDetailsPromises);
      setSavedProducts(productResponses.map(res => res.data));

    } catch (error) {
      console.error("Lỗi khi tải danh sách đã lưu:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm đã lưu.");
      setSavedProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // 3. Sử dụng useFocusEffect để tải lại danh sách mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      if (currentUser !== null) {
        fetchFavoriteIds();
      }
      return () => {};
    }, [currentUser, fetchFavoriteIds])
  );
  
  // 4. Component hiển thị trạng thái Loading
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-3 text-gray-600">Đang tải sản phẩm đã lưu...</Text>
      </View>
    );
  }

  // 5. Render từng item sản phẩm
  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
      className="flex-row mb-4 bg-white rounded-lg shadow-md overflow-hidden"
    >
      <Image
        source={{
          uri: item.thumbnail_url || "https://via.placeholder.com/150",
        }}
        className="w-24 h-24 object-cover"
      />
      <View className="flex-1 p-3 justify-center">
        <Text className="text-lg font-semibold" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-red-600 font-bold mt-1">
          {parseFloat(item.price).toLocaleString()} đ
        </Text>
      </View>
      <View className="p-3 justify-center">
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  // 6. Main render
  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">❤️ Sản phẩm đã lưu</Text>

      {currentUser === null ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg font-semibold mb-2">Bạn chưa đăng nhập</Text>
          <Text className="text-gray-500 text-center">
            Vui lòng đăng nhập để xem danh sách sản phẩm đã lưu của bạn.
          </Text>
        </View>
      ) : savedProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="heart-dislike-outline" size={50} color="#D1D5DB" />
          <Text className="text-lg font-semibold mt-4">Chưa có sản phẩm nào được lưu</Text>
          <Text className="text-gray-500 text-center mt-1">
            Hãy tìm kiếm các món đồ cũ yêu thích của bạn để thêm vào đây!
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}