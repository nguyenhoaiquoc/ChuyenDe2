import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
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

// Định nghĩa các tab (Nguồn chân lý là product_status_id)
const TABS = {
  PENDING: "Chờ duyệt", // product_status_id: 1
  APPROVED: "Đã duyệt", // product_status_id: 2
  REJECTED: "Bị từ chối", // product_status_id: 3
  HIDDEN: "Đã ẩn", // product_status_id: 4
};

type NavProps = ManageProductsScreenNavigationProp;

// Hàm mapProductData (Giữ nguyên)
const mapProductData = (item: any): Product => {
  const imageUrl = item.images?.[0]?.image_url || item.thumbnail_url || "";
  return {
    ...item, // Lấy tất cả dữ liệu gốc
    id: item.id.toString(),
    image: imageUrl.startsWith("http") ? imageUrl : `${path}${imageUrl}`,
    authorName: item.user?.name || "Người dùng", // Đảm bảo product_status_id luôn là số (hoặc null) để so sánh
    product_status_id: item.product_status_id
      ? parseInt(item.product_status_id, 10)
      : 1, // Mặc định là 1 nếu null
  } as Product;
};

export default function ManageProductsScreen() {
  const navigation = useNavigation<NavProps>();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Product[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState(TABS.PENDING); // Hàm tải dữ liệu (Giữ nguyên)

  const fetchAllPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${path}/products/admin/all`);
      const mappedData = response.data.map(mapProductData);
      setAllPosts(mappedData);
    } catch (error: any) {
      console.error("Lỗi tải tin đăng (admin):", error.message);
      Alert.alert("Lỗi", "Không thể tải danh sách tin đăng.");
    } finally {
      setIsLoading(false);
    }
  }; // Tải dữ liệu khi vào màn hình hoặc quay lại (Giữ nguyên)

  useEffect(() => {
    if (isFocused) {
      fetchAllPosts();
    }
  }, [isFocused]);

  // === SỬA LỖI LOGIC LỌC ===
  // Lọc danh sách dựa trên product_status_id
  useEffect(() => {
    let posts: Product[] = [];
    if (activeTab === TABS.PENDING) {
      // Chỉ lấy tin có status = 1 (Chờ duyệt)
      // Dùng p.productStatus?.id thay vì p.product_status_id
      posts = allPosts.filter((p) => p.productStatus?.id == 1);
    } else if (activeTab === TABS.APPROVED) {
      // Chỉ lấy tin có status = 2 (Đã duyệt)
      posts = allPosts.filter((p) => p.productStatus?.id == 2);
    } else if (activeTab === TABS.REJECTED) {
      // Chỉ lấy tin có status = 3 (Bị từ chối)
      posts = allPosts.filter((p) => p.productStatus?.id == 3);
    } else if (activeTab === TABS.HIDDEN) {
      // Chỉ lấy tin có status = 4 (Đã ẩn)
      posts = allPosts.filter((p) => p.productStatus?.id == 4);
    }
    setFilteredPosts(posts);
  }, [activeTab, allPosts]); // Hàm xử lý duyệt/từ chối

  // === SỬA LỖI LOGIC CẬP NHẬT ===
  const handleUpdateStatus = async (product: Product, isApproved: boolean) => {
    const newStatus = {
      is_approved: isApproved, // true nếu duyệt, false nếu từ chối
      product_status_id: isApproved ? 2 : 3, // 2 = Đã duyệt, 3 = Bị từ chối
    };

    try {
      // 1. Gọi API PATCH
      await axios.patch(
        `${path}/products/admin/status/${product.id}`,
        newStatus
      ); // 2. Cập nhật UI (Optimistic update)
      // Xóa bài đăng khỏi danh sách hiện tại (vì nó đã đổi status)

      setAllPosts((prevPosts) => prevPosts.filter((p) => p.id !== product.id));

      Alert.alert("Thành công", `Đã ${isApproved ? "duyệt" : "từ chối"} tin.`);
    } catch (err: any) {
      console.error("Lỗi cập nhật status:", err.message);
      Alert.alert("Lỗi", "Cập nhật thất bại.");
    }
  }; // Component render từng hàng (Giữ nguyên)

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemUser}>Người đăng: {item.authorName}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        {/* Nút bấm (Chỉ hiển thị ở tab "Chờ duyệt") */}
        {activeTab === TABS.PENDING && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleUpdateStatus(item, true)} // Duyệt
            >
              <Text style={styles.actionButtonText}>Duyệt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleUpdateStatus(item, false)} // Từ chối
            >
              <Text style={styles.actionButtonText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Tin đăng</Text>
        <View className="w-6" />
      </View>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {Object.values(TABS).map((tabName) => (
          <TouchableOpacity
            key={tabName}
            style={[styles.tab, activeTab === tabName && styles.tabActive]}
            onPress={() => setActiveTab(tabName)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tabName && styles.tabTextActive,
              ]}
            >
              {tabName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Danh sách */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#8c7ae6" style={{ flex: 1 }} />
      ) : filteredPosts.length === 0 ? (
        <View style={styles.noPosts}>
          <Text style={styles.noPostsText}></Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </SafeAreaView>
  );
}

// Styles (Giữ nguyên)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  tabActive: {
    backgroundColor: "#8c7ae6",
  },
  tabText: {
    fontSize: 14,
    color: "#555",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  noPosts: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noPostsText: {
    fontSize: 16,
    color: "#888",
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemUser: {
    fontSize: 12,
    color: "#555",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#d9534f",
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#5cb85c", // Màu xanh lá
  },
  rejectButton: {
    backgroundColor: "#d9534f", // Màu đỏ
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
