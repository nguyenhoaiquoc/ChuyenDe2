import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import { path } from "../../config";

type Props = {
  route: RouteProp<RootStackParamList, "SearchResultScreen">;
};

interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail_url?: string | null;
  category?: { name: string };
  subCategory?: { name: string };
  condition?: { name: string };
}

export default function SearchResultScreen({ route }: Props) {
  const { query } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const limit = 20;

  const fetchProducts = useCallback(
    async (pageNumber = 1, refresh = false) => {
      if (loading) return;
      try {
        if (!refresh) setLoading(true);
        const res = await axios.get(
          `${path}/products/search?q=${encodeURIComponent(query)}&page=${pageNumber}&limit=${limit}`
        );
        const data: Product[] = res.data;

        if (refresh) {
          setProducts(data);
        } else {
          setProducts((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === limit);
        setPage(pageNumber);
        setError("");
      } catch (err) {
        setError("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
        if (refresh) setRefreshing(false);
      }
    },
    [query, loading]
  );

  useEffect(() => {
    fetchProducts(1, true);
  }, [query]);

  // --- Pull to refresh ---
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, true);
  };

  // --- Load more khi scroll ---
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchProducts(page + 1);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={{ flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}
      onPress={() => navigation.navigate("ProductDetail", { product: { id: item.id } } as any)}

    >
      <Image
        source={{ uri: item.thumbnail_url || undefined }}
        style={{ width: 64, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: "#f0f0f0" }}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#333" }}>{item.name}</Text>
        <Text style={{ fontSize: 14, color: "#555", marginTop: 2 }}>
          {item.condition?.name || "Không rõ tình trạng"}{" "}
          {item.category ? `- ${item.category.name}` : ""}
          {item.subCategory ? ` - ${item.subCategory.name}` : ""}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#007AFF", marginTop: 4 }}>
          {item.price.toLocaleString()}₫
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="black" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: "600", color: "#333" }}>
          Kết quả cho "{query}"
        </Text>
      </View>

      {/* Nội dung */}
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#555" }}>Không tìm thấy sản phẩm nào phù hợp.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListFooterComponent={
            loading && page > 1 ? <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 12 }} /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}
