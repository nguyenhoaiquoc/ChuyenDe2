import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../types";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import { path } from "../../config";
type Props = {
  route: RouteProp<RootStackParamList, "SearchResultScreen">;
};

export default function SearchResultScreen({ route }: Props) {
  const { query } = route.params;
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${path}/products/search?q=${encodeURIComponent(query)}`
      );
      setProducts(res.data);
      setError("");
    } catch (err) {
      setError("Lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [query]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-gray-200">
      <Image
        source={{ uri: item.thumbnail_url || item.image }}
        className="w-16 h-16 rounded mr-4"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.condition?.name || "Không rõ tình trạng"}</Text>
        <Text className="text-sm text-blue-600 font-semibold mt-1">{item.price}₫</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header có nút quay lại */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="black" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-semibold">Kết quả cho “{query}”</Text>
      </View>

      {/* Nội dung */}
      {loading ? (
        <ActivityIndicator size="large" className="mt-10" />
      ) : error ? (
        <View className="p-4">
          <Text className="text-red-500">{error}</Text>
        </View>
      ) : products.length === 0 ? (
        <View className="p-4">
          <Text className="text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}
