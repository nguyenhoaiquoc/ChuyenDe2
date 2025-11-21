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
  Modal,
  ScrollView,
  TextInput,
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
interface FilterState {
  minPrice: string;
  maxPrice: string;
  category: string;
  conditions: string[];
  sortBy: "price" | "created_at";
  sort: "asc" | "desc";
}

export default function SearchResultScreen({ route }: Props) {
  const { query } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [products, setProducts] = useState<Partial<Product>[]>([]); // Dùng Partial để tránh lỗi TS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [showFilter, setShowFilter] = useState(false);

  // Bộ lọc mạnh như Shopee
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    category: "",
    conditions: [] as string[],
    sortBy: "created_at", 
    sort: "desc"
  });

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fetchProducts = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      if (!isRefresh && loading) return;

      try {
        !isRefresh && setLoading(true);

        const params = new URLSearchParams({
          name: query.trim(),
          page: pageNum.toString(),
          limit: "20",
          sortBy: filters.sortBy,
          sort: filters.sort,
        });

        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (filters.category) params.append("category", filters.category);
        filters.conditions.forEach((c) => params.append("condition", c));

        const res = await axios.get(`${path}/products/search?${params.toString()}`);
        const { data, total: count } = res.data;

        if (isRefresh || pageNum === 1) {
          setProducts(data);
        } else {
          setProducts((prev) => [...prev, ...data]);
        }

        setTotal(count || 0);
        setHasMore(data.length === 20);
        setPage(pageNum);
        setError("");
        fadeIn();
      } catch (err: any) {
        console.error("Lỗi tìm kiếm:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query, filters]
  );

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [query, filters]);

  const handleLoadMore = () => {
    if (hasMore && !loading) fetchProducts(page + 1);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, true);
  };

  const applyFilters = () => {
    setShowFilter(false);
    setPage(1);
    setProducts([]);
  };

  const resetFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      category: "",
      conditions: [],
      sortBy: "created_at",
      sort: "desc",
    });
  };

  const renderItem = ({ item }: { item: Partial<Product> }) => (
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
        elevation: 3,
      }}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("ProductDetail", { product: item as any })}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{
            uri:
              item.thumbnail_url ||
              item.images?.[0]?.image_url ||
              "https://cdn-icons-png.flaticon.com/512/4076/4076505.png",
          }}
          style={{ width: "100%", height: 160, backgroundColor: "#f5f5f5" }}
          resizeMode="cover"
        />
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
      </View>

      <View style={{ padding: 10 }}>
        <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: "600" }}>
          {item.name}
        </Text>

        <Text style={{ marginTop: 4, color: "#555", fontSize: 13 }}>
          {(item.category?.name || "") +
            (item.subCategory?.name ? ` • ${item.subCategory.name}` : "") ||
            "Danh mục"}
        </Text>

        {item.condition && (
          <Text
            style={{
              marginTop: 4,
              alignSelf: "flex-start",
              backgroundColor: "#28a745",
              color: "#fff",
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              fontSize: 11,
              fontWeight: "600",
            }}
          >
            {item.condition.name}
          </Text>
        )}

        <Text
          style={{
            marginTop: 6,
            fontSize: 15,
            fontWeight: "700",
            color: item.price === 0 ? "#FF3B30" : "#007AFF",
          }}
        >
          {item.price === 0 ? "Miễn phí" : `${Number(item.price).toLocaleString()}₫`}
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
          justifyContent: "space-between",
          padding: 12,
          borderBottomWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
            <Feather name="arrow-left" size={22} color="#333" />
          </TouchableOpacity>
          <Text numberOfLines={1} style={{ marginLeft: 8, fontSize: 18, fontWeight: "600", flex: 1 }}>
            Kết quả cho “{query}” {total > 0 && `(${total})`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowFilter(true)} style={{ padding: 6 }}>
          <Feather name="sliders" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Nội dung */}
      {error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Feather name="alert-circle" size={48} color="#FF3B30" />
          <Text style={{ color: "#FF3B30", marginTop: 10 }}>{error}</Text>
        </View>
      ) : loading && products.length === 0 ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/4076/4076505.png" }}
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
            keyExtractor={(item) => item.id!.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 8 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListFooterComponent={loading && page > 1 ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
          />
        </Animated.View>
      )}

      {/* Modal Filter - Đỉnh cao như Shopee */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#eee", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Bộ lọc & Sắp xếp</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              {/* Khoảng giá */}
              <Text style={{ fontWeight: "600", marginBottom: 8 }}>Khoảng giá</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <TextInput
                  placeholder="Từ"
                  keyboardType="numeric"
                  value={filters.minPrice}
                  onChangeText={(t) => setFilters(p => ({ ...p, minPrice: t.replace(/[^0-9]/g, "") }))}
                  style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 }}
                />
                <Text>—</Text>
                <TextInput
                  placeholder="Đến"
                  keyboardType="numeric"
                  value={filters.maxPrice}
                  onChangeText={(t) => setFilters(p => ({ ...p, maxPrice: t.replace(/[^0-9]/g, "") }))}
                  style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 }}
                />
              </View>

              {/* Danh mục */}
              <Text style={{ fontWeight: "600", marginTop: 20, marginBottom: 8 }}>Danh mục</Text>
              <TextInput
                placeholder="VD: Điện thoại, Xe máy, Thời trang..."
                value={filters.category}
                onChangeText={(t) => setFilters(p => ({ ...p, category: t }))}
                style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 }}
              />

              {/* Tình trạng */}
              <Text style={{ fontWeight: "600", marginTop: 20, marginBottom: 8 }}>Tình trạng</Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {["Mới", "Cũ"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() =>
                      setFilters((p) => ({
                        ...p,
                        conditions: p.conditions.includes(c)
                          ? p.conditions.filter((x) => x !== c)
                          : [...p.conditions, c],
                      }))
                    }
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 20,
                      backgroundColor: filters.conditions.includes(c) ? "#007AFF" : "#f0f0f0",
                    }}
                  >
                    <Text style={{ color: filters.conditions.includes(c) ? "#fff" : "#333" }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sắp xếp */}
              <Text style={{ fontWeight: "600", marginTop: 20, marginBottom: 8 }}>Sắp xếp theo</Text>
              {[
                { label: "Mới nhất", sortBy: "created_at", sort: "desc" },
                { label: "Giá thấp → cao", sortBy: "price", sort: "asc" },
                { label: "Giá cao → thấp", sortBy: "price", sort: "desc" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => setFilters((p) => ({ ...p, sortBy: opt.sortBy, sort: opt.sort }))}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    backgroundColor:
                      filters.sortBy === opt.sortBy && filters.sort === opt.sort ? "#007AFF" : "#f8f8f8",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: filters.sortBy === opt.sortBy && filters.sort === opt.sort ? "#fff" : "#333" }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", padding: 16, gap: 12 }}>
              <TouchableOpacity
                onPress={() => { resetFilters(); applyFilters(); }}
                style={{ flex: 1, padding: 16, backgroundColor: "#ddd", borderRadius: 10 }}
              >
                <Text style={{ textAlign: "center", fontWeight: "600" }}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                style={{ flex: 1, padding: 16, backgroundColor: "#007AFF", borderRadius: 10 }}
              >
                <Text style={{ textAlign: "center", color: "#fff", fontWeight: "600" }}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}