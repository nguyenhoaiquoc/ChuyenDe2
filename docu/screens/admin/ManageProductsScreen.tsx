import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import {
  RootStackParamList,
  Product,
  ManageProductsScreenNavigationProp,
} from "../../types";
import axios from "axios";
import { path } from "../../config";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

// Tabs
const TABS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  HIDDEN: "Đã ẩn",
};

type NavProps = ManageProductsScreenNavigationProp;

// Map product
const mapProductData = (item: any): Product => {
  const imageUrl = item.images?.[0]?.image_url || item.thumbnail_url || "";
  return {
    ...item,
    id: item.id.toString(),
    image: imageUrl.startsWith("http") ? imageUrl : `${path}${imageUrl}`,
    authorName: item.user?.name || "Người dùng",
    product_status_id: item.product_status_id
      ? parseInt(item.product_status_id, 10)
      : 1,
  } as Product;
};

export default function ManageProductsScreen() {
  const navigation = useNavigation<NavProps>();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allPosts, setAllPosts] = useState<Product[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState(TABS.PENDING);

  const fetchAllPosts = async () => {
    try {
      const response = await axios.get(`${path}/products/admin/all`);
      const publicPosts = response.data.filter(
        (item: any) => item.visibility_type == "0"
      );
      const mappedData = publicPosts.map(mapProductData);
      setAllPosts(mappedData);
    } catch (error: any) {
      console.error("Lỗi tải tin đăng (admin):", error.message);
      Alert.alert("Lỗi", "Không thể tải danh sách tin đăng.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      fetchAllPosts();
    }
  }, [isFocused]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllPosts();
  }, []);

  useEffect(() => {
    let posts: Product[] = [];
    if (activeTab === TABS.PENDING)
      posts = allPosts.filter((p) => p.productStatus?.id == 1);
    else if (activeTab === TABS.APPROVED)
      posts = allPosts.filter((p) => p.productStatus?.id == 2);
    else if (activeTab === TABS.REJECTED)
      posts = allPosts.filter((p) => p.productStatus?.id == 3);
    else if (activeTab === TABS.HIDDEN)
      posts = allPosts.filter((p) => p.productStatus?.id == 4);
    setFilteredPosts(posts);
  }, [activeTab, allPosts]);

  const handleUpdateStatus = async (product: Product, isApproved: boolean) => {
    const newStatus = {
      product_status_id: isApproved ? 2 : 3, // 2 = Đã duyệt, 3 = Bị từ chối
    };
    try {
      await axios.patch(
        `${path}/products/admin/status/${product.id}`,
        newStatus
      );
      setAllPosts((prevPosts) => prevPosts.filter((p) => p.id !== product.id));
      Alert.alert("Thành công", `Đã ${isApproved ? "duyệt" : "từ chối"} tin.`);
    } catch (err: any) {
      console.error("Lỗi cập nhật status:", err.message);
      Alert.alert("Lỗi", "Cập nhật thất bại.");
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="flex-row bg-white mx-4 my-2 rounded-lg p-3 shadow"
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-md bg-gray-200"
      />
      <View className="flex-1 ml-3 justify-between">
        <Text
          className="text-base font-semibold text-gray-800"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text className="text-sm text-gray-600">
          Người đăng: {item.authorName}
        </Text>
        <Text className="text-sm font-bold text-red-600 mt-1">
          {item.dealType?.name === "Miễn phí"
            ? "Miễn phí"
            : item.dealType?.name === "Trao đổi"
              ? "Trao đổi"
              : item.price
                ? `${Number(item.price).toLocaleString("vi-VN")} đ`
                : "Liên hệ"}
        </Text>

        {activeTab === TABS.PENDING && (
          <View className="flex-row mt-2 space-x-2">
            <TouchableOpacity
              className="flex-1 py-2 bg-green-500 rounded-md items-center"
              onPress={() => handleUpdateStatus(item, true)}
            >
              <Text className="text-white font-semibold">Duyệt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-2 bg-red-500 rounded-md items-center"
              onPress={() => handleUpdateStatus(item, false)}
            >
              <Text className="text-white font-semibold">Từ chối</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center h-14 px-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Quản lý Tin đăng
        </Text>
        <View className="w-6" />
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white px-2 py-2">
        {Object.values(TABS).map((tabName) => (
          <TouchableOpacity
            key={tabName}
            className={`px-4 py-2 rounded-full mr-2 ${
              activeTab === tabName ? "bg-indigo-600" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab(tabName)}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tabName ? "text-white" : "text-gray-700"
              }`}
            >
              {tabName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#8c7ae6"
          className="flex-1 mt-10"
        />
      ) : filteredPosts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-500 text-base">
            Không có tin đăng nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
