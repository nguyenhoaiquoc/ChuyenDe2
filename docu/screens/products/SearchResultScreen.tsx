import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { RootStackParamList } from "../../types";
import { path } from "../../config";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

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
   images?: { image_url: string }[];
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

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animateList = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const fetchProducts = useCallback(
    async (pageNumber = 1, refresh = false) => {
      if (loading && !refresh) return;
      try {
        if (!refresh) setLoading(true);
        const res = await axios.get(
          `${path}/products/search?name=${encodeURIComponent(query)}&page=${pageNumber}&limit=${limit}`
        );
        const data: Product[] = res.data.data || [];
        console.log(data)
        if (refresh) {
          setProducts(data);
        } else {
          setProducts((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === limit);
        setPage(pageNumber);
        setError("");
        animateList();
      } catch (err) {
        setError("Không thể tải dữ liệu, vui lòng thử lại.");
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) fetchProducts(page + 1);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={{
        width: CARD_WIDTH,
        margin: 8,
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("ProductDetail", { product: item } as any)
      }
    >
      
      
      {/* Ảnh sản phẩm */}
      <View style={{ position: "relative" }}>
        <Image
          source={{
            uri:
              item.thumbnail_url ||
              item?.images?.[0]?.image_url ||
              "https://cdn-icons-png.flaticon.com/512/4076/4076505.png",
          }}
          style={{
            width: "100%",
            height: 160,
            backgroundColor: "#f5f5f5",
          }}
          resizeMode="cover"
        />

        {/* Góc trên phải: tim */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "#fff",
            padding: 6,
            borderRadius: 20,
            elevation: 3,
          }}
        >
          <Feather name="heart" size={18} color="#ff4d4f" />
        </TouchableOpacity>

        {/* Dòng thời gian và số ảnh */}
        <View
          style={{
            position: "absolute",
            bottom: 6,
            left: 6,
            backgroundColor: "rgba(0,0,0,0.6)",
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
         
        </View>
      </View>

      {/* Thông tin chi tiết */}
      <View style={{ padding: 10 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#222",
          }}
        >
          {item.name}
        </Text>

        {/* Trạng thái */}
        <View
          style={{
            marginTop: 4,
            alignSelf: "flex-start",
            backgroundColor: "#28a745",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
            Đang bán
          </Text>
        </View>

        {/* Danh mục */}
        <Text
          style={{
            marginTop: 4,
            color: "#555",
            fontSize: 13,
          }}
        >
          {item.category?.name || "Danh mục"}
        </Text>

        {/* Giá */}
        <Text
          style={{
            marginTop: 4,
            fontSize: 15,
            fontWeight: "700",
            color: Number(item.price) === 0 ? "#FF3B30" : "#007AFF",
          }}
        >
          {Number(item.price) === 0
            ? "Miễn phí"
            : `${Number(item.price).toLocaleString()}₫`}
        </Text>

      </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }} edges={["top", "bottom"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          borderBottomWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
          elevation: 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Feather name="arrow-left" size={22} color="#333" />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 8,
            fontSize: 18,
            fontWeight: "600",
            color: "#333",
          }}
        >
          Kết quả cho “{query}”
        </Text>
      </View>
      <View style={{ padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#eee" }}>
  <Text style={{ fontWeight: "600", marginBottom: 6 }}>Bộ lọc</Text>
  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
    <TouchableOpacity
      onPress={() => navigation.setParams({ sort: "asc" })}
      style={{ padding: 6, backgroundColor: "#eee", borderRadius: 6, marginRight: 8 }}
    >
      <Text>Giá tăng dần</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => navigation.setParams({ sort: "desc" })}
      style={{ padding: 6, backgroundColor: "#eee", borderRadius: 6 }}
    >
      <Text>Giá giảm dần</Text>
    </TouchableOpacity>
  </View>
</View>


      {/* Nội dung */}
      {error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Feather name="alert-circle" size={48} color="#FF3B30" />
          <Text style={{ color: "#FF3B30", marginTop: 10 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchProducts(1, true)}
            style={{
              backgroundColor: "#007AFF",
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        
      ) : loading && products.length === 0 ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          
          <Image
            source={{
               uri: "https://cdn-icons-png.flaticon.com/512/4076/4076505.png",
            }}
            style={{ width: 120, height: 120, opacity: 0.8 }}
          />
          <Text style={{ color: "#555", marginTop: 10, fontSize: 16 }}>
            Không tìm thấy sản phẩm nào
          </Text>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={products}
            numColumns={2}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 8 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListFooterComponent={
              loading && page > 1 ? (
                <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 12 }} />
              ) : null
            }
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
