import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Product } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../config";
import ProductCard from "../../components/ProductCard";
import "../../global.css";

const statusTabs = ["Đã duyệt", "Chờ duyệt", "Từ chối", "Đã ẩn"];
const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) {
    return seconds < 5 ? "vừa xong" : `${seconds} giây trước`;
  }
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
      if (addr.full) {
        locationText = addr.full;
      } else {
        const parts = [addr.ward, addr.district, addr.province]
          .filter(Boolean)
          .slice(-2);
        locationText = parts.length > 0 ? parts.join(", ") : "Chưa rõ địa chỉ";
      }
    } catch (e) {
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
  if (categoryName && subCategoryName) {
    tagText = `${categoryName} - ${subCategoryName}`;
  } else if (categoryName) {
    tagText = categoryName;
  } else if (subCategoryName) {
    tagText = subCategoryName;
  }

  return {
    id: item.id.toString(),
    image: imageUrl,
    name: item.name || "Không có tiêu đề",
    price: (() => {
      if (item.dealType?.name === "Miễn phí") return "Miễn phí";
      if (item.dealType?.name === "Trao đổi") return "Trao đổi";
      return item.price
        ? `${Number(item.price).toLocaleString("vi-VN")} đ`
        : "Liên hệ";
    })(),
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

type NavProps = NativeStackNavigationProp<
  RootStackParamList,
  "ManagePostsScreen"
>;

export default function ManagePostsScreen({
  navigation,
}: {
  navigation: NavProps;
}) {
  const isFocused = useIsFocused();
  const [activeStatus, setActiveStatus] = useState(0); // Tab 0 = "Đang hiển thị"

  // === THÊM STATE MỚI ===
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Product[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Hàm load data chính
  const fetchMyPosts = async (currentUserId: string) => {
    setIsLoading(true);
    try {
      // 1. Gọi API mới (bạn tạo ở Bước 1)
      const response = await axios.get(
        `${path}/products/my-posts/${currentUserId}`
      );
      // 2. Map dữ liệu (dùng hàm mapProductData ở trên)
      const mappedData = response.data.map(mapProductData);
      setAllPosts(mappedData);

      // 3. Lấy danh sách yêu thích (để ProductCard biết tim màu gì)
      const favRes = await axios.get(`${path}/favorites/user/${currentUserId}`);
      setFavoriteIds(favRes.data.productIds || []);
    } catch (error: any) {
      console.error("Lỗi tải tin đăng:", error.message);
      Alert.alert("Lỗi", "Không thể tải tin đăng của bạn.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tải dữ liệu khi vào màn hình hoặc quay lại
  useEffect(() => {
    const loadData = async () => {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("userName");
      if (id) {
        setUserId(id);
        setUserName(name || "Người dùng"); // Lấy tên user
        if (isFocused) {
          fetchMyPosts(id);
        }
      } else {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để xem tin.");
        navigation.goBack();
        setIsLoading(false);
      }
    };
    loadData();
  }, [isFocused]);

  // Lọc danh sách sản phẩm khi 'activeStatus' (tab) hoặc 'allPosts' thay đổi
  useEffect(() => {
    const selectedTabName = statusTabs[activeStatus].trim();
    let posts: Product[] = []; // Ánh xạ tên tab với product_status_id

    if (selectedTabName === "Đã duyệt") {
      // SỬA: Lọc trực tiếp theo status 2
      posts = allPosts.filter((p) => p.productStatus?.id === 2);
    } else if (selectedTabName === "Chờ duyệt") {
      // SỬA: Lọc trực tiếp theo status 1 (hoặc null nếu là tin mới)
      posts = allPosts.filter(
        (p) => p.productStatus?.id === 1 || p.productStatus == null
      );
    } else if (selectedTabName === "Từ chối") {
      // Giữ nguyên: Lọc theo status 3
      posts = allPosts.filter((p) => p.productStatus?.id === 3);
    } else if (selectedTabName === "Đã ẩn") {
      // Giữ nguyên: Lọc theo status 4
      posts = allPosts.filter((p) => p.productStatus?.id === 4);
    }

    setFilteredPosts(posts);
  }, [activeStatus, allPosts]);

  // Hàm xử lý (Bỏ) Yêu thích
  const handleToggleFavorite = async (productId: string) => {
    if (!userId) return;
    try {
      // Cập nhật UI trước (Optimistic Update)
      const newFavoriteIds = favoriteIds.includes(productId)
        ? favoriteIds.filter((id) => id !== productId)
        : [...favoriteIds, productId];
      setFavoriteIds(newFavoriteIds);

      // Gọi API
      await axios.post(
        `${path}/favorites/toggle/${productId}?userId=${userId}`
      );

      // (Không cần fetch lại vì chúng ta chỉ cập nhật mảng ID)
    } catch (err: any) {
      console.log("Lỗi toggle yêu thích:", err.message);
      // Rollback UI nếu lỗi
      setFavoriteIds(favoriteIds);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (Giữ nguyên) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý đăng tin</Text>
        <View style={styles.headerIcons}>
          <Feather name="search" size={22} color="black" style={styles.icon} />
          <Ionicons
            name="chatbox-ellipses-outline"
            size={22}
            color="black"
            style={styles.icon}
          />
          <Feather name="bell" size={24} color="black" style={styles.icon} />
        </View>
      </View>

      {/* Body */}
      {/* SỬA LẠI: Dùng FlatList thay vì ScrollView lồng nhau */}
      <FlatList
        ListHeaderComponent={
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <TouchableOpacity style={styles.contactListButton}>
                <Text style={styles.contactListText}>Danh sách liên hệ </Text>
              </TouchableOpacity>

              {/* Profile */}
              <View style={styles.profileContainer}>
                <Image
                  source={require("../../assets/meo.jpg")}
                  style={styles.avatar}
                />
                <View style={styles.profileText}>
                  <Text style={styles.name}>{userName || "Người dùng"}</Text>
                  <TouchableOpacity>
                    <Text style={styles.createShop}>+ Tạo cửa hàng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Status Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statusTabs}
              contentContainerStyle={{ paddingHorizontal: 20 }} // Thêm padding
            >
              {statusTabs.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.statusTab,
                    index === activeStatus && styles.statusTabActive,
                  ]}
                  onPress={() => setActiveStatus(index)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      index === activeStatus && styles.statusTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Search Bar */}
            <View style={[styles.searchBar, { marginHorizontal: 20 }]}>
              <Feather name="search" size={18} color="#888" />
              <TextInput
                placeholder="Tìm tin đăng của bạn"
                style={styles.searchInput}
              />
            </View>

            {/* HIỂN THỊ LOADING HOẶC DANH SÁCH */}
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#8c7ae6"
                style={{ marginTop: 50 }}
              />
            ) : filteredPosts.length === 0 ? (
              // No posts (Giữ nguyên)
              <View style={styles.noPosts}>
                <Text style={styles.noPostsTitle}>Không tìm thấy tin đăng</Text>
                <Text style={styles.noPostsSubtitle}>
                  Bạn hiện tại không có tin đăng nào cho trạng thái này
                </Text>
                <TouchableOpacity
                  style={styles.postButton}
                  onPress={() => navigation.navigate("ChooseCategoryScreen")}
                >
                  <Text style={styles.postButtonText}>Đăng tin</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        }
        // === RENDER DANH SÁCH SẢN PHẨM ===
        data={filteredPosts} // Dùng data đã lọc
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 20, // Di chuyển padding vào đây
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isFavorite={favoriteIds.includes(item.id)} // Lấy từ state
            onToggleFavorite={() => handleToggleFavorite(item.id)}
            onPress={() =>
              navigation.navigate("ProductDetail", { product: item })
            }
            onPressPostType={() => {}} // Không cần thiết ở đây
          />
        )}
      />

      <Menu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: "#F2F0FF",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  headerIcons: { flexDirection: "row" },
  icon: { marginLeft: 16 },

  // body: { flex: 1 }, // (Đã xóa style này vì dùng FlatList)
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    // paddingHorizontal: 20, // (Đã chuyển padding ra ngoài)
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  profileText: { marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  createShop: { color: "#3C2EFC", marginTop: 4 },

  statusTabs: { marginVertical: 10 },
  statusTab: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
  },
  statusTabActive: { backgroundColor: "#3C2EFC" },
  statusText: { fontSize: 14, color: "#333" },
  statusTextActive: { color: "#fff" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 8,
    marginVertical: 10,
    height: 50,
    // marginHorizontal: 20, // (Đã chuyển lên style inline)
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  noPosts: { alignItems: "center", marginTop: 50, paddingHorizontal: 20 },
  noPostsTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  noPostsSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: "#F6C200",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 6,
  },
  postButtonText: { fontWeight: "600", fontSize: 14 },

  contactListButton: {
    backgroundColor: "#E5E5E5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
    alignSelf: "flex-start",
    // marginHorizontal: 20, // (Đã chuyển padding ra ngoài)
  },
  contactListText: { fontSize: 14, color: "#555" },
});
