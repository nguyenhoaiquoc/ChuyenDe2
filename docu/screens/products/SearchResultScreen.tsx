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
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const [showFilter, setShowFilter] = useState(false);

  // state bộ lọc
  const [filterOptions, setFilterOptions] = useState({
    sort: "", // "asc" | "desc"
    category: "",
    condition: "",
  });

  // demo category và condition — cậu có thể fetch từ backend nếu có API
  const categories = ["Tài liệu khoa", "Thời trang, đồ dùng cá nhân", "Đồ gia dụng, nội thất, cây cảnh", "Đồ điện tử","Thú cưng","Xe cộ","Giải trí, thể thao, sở thích"];
  const conditions = ["Mới", "Cũ"];

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

        const params = new URLSearchParams();
        params.append("name", query);
        params.append("page", pageNumber.toString());
        params.append("limit", limit.toString());
        if (filterOptions.sort) params.append("sort", filterOptions.sort);
        if (filterOptions.category)
          params.append("category", filterOptions.category);
        if (filterOptions.condition)
          params.append("condition", filterOptions.condition);

        const res = await axios.get(`${path}/products/search?${params.toString()}`);
        const data: Product[] = res.data.data || [];
        if (refresh) setProducts(data);
        else setProducts((prev) => [...prev, ...data]);
        setHasMore(data.length === limit);                                  
        setPage(pageNumber);
        setError("");
        animateList();
        
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu, vui lòng thử lại.");
      } finally {
        setLoading(false);
        if (refresh) setRefreshing(false);
      }
    },
    [query, loading, filterOptions]
  );

  useEffect(() => {
    fetchProducts(1, true);
  }, [query, filterOptions]);

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
        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "500" }}>
          {item.name}
        </Text>
        <Text
          style={{
            marginTop: 4,
            alignSelf: "flex-start",
            backgroundColor: "#28a745",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
            color: "#fff",
            fontSize: 11,
            fontWeight: "600",
          }}
        >
          Đang bán
        </Text>
        <Text style={{ marginTop: 4, color: "#555", fontSize: 13 }}>
          {item.category?.name || "Danh mục"}
        </Text>
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
          justifyContent: "space-between",
          padding: 12,
          borderBottomWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
            <Feather name="arrow-left" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: "600" }}>
            Kết quả cho “{query}”
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowFilter(true)} style={{ padding: 6 }}>
          <Feather name="filter" size={22} color="#333" />
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
            keyExtractor={(item, index) => String(item?.id ?? index)}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 8 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        </Animated.View>
      )}

      {/* Modal Filter */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "70%",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
              Bộ lọc
            </Text>
            <ScrollView>
              {/* Sắp xếp giá */}
              <Text style={{ fontWeight: "600", marginVertical: 6 }}>Sắp xếp theo giá</Text>
              <View style={{ flexDirection: "row" }}>
                {["asc", "desc"].map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => setFilterOptions((prev) => ({ ...prev, sort: v }))}
                    style={{
                      flex: 1,
                      margin: 4,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor:
                        filterOptions.sort === v ? "#007AFF" : "#f2f2f2",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: filterOptions.sort === v ? "#fff" : "#333",
                      }}
                    >
                      {v === "asc" ? "Giá tăng dần" : "Giá giảm dần"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Danh mục */}
              <Text style={{ fontWeight: "600", marginVertical: 6 }}>Danh mục</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      setFilterOptions((prev) => ({ ...prev, category: cat }))
                    }
                    style={{
                      margin: 4,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      backgroundColor:
                        filterOptions.category === cat ? "#007AFF" : "#f2f2f2",
                    }}
                  >
                    <Text
                      style={{
                        color: filterOptions.category === cat ? "#fff" : "#333",
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tình trạng */}
              <Text style={{ fontWeight: "600", marginVertical: 6 }}>Tình trạng</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {conditions.map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    onPress={() =>
                      setFilterOptions((prev) => ({ ...prev, condition: cond }))
                    }
                    style={{
                      margin: 4,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      backgroundColor:
                        filterOptions.condition === cond ? "#007AFF" : "#f2f2f2",
                    }}
                  >
                    <Text
                      style={{
                        color: filterOptions.condition === cond ? "#fff" : "#333",
                      }}
                    >
                      {cond}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Nút hành động */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 14,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setFilterOptions({ sort: "", category: "", condition: "" });
                  setShowFilter(false);
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#ccc",
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ textAlign: "center", color: "#fff", fontWeight: "600" }}>
                  Đặt lại
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilter(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#007AFF",
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ textAlign: "center", color: "#fff", fontWeight: "600" }}>
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
