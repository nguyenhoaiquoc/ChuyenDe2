import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import "../../global.css";
import { path } from "../../config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

// ************************ INTERFACES (Giữ nguyên) ************************
interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    fullName: string;
    image?: string;
  };
}

interface ProductImage {
  id: string;
  product_id: string;
  name: string;
  image_url: string;
  created_at: string;
}

interface Condition {
  id: string;
  name: string;
}

interface ProductType {
  id: string;
  name: string;
}

interface PostType {
  id: string;
  name: string;
}
interface AddressJson {
  full: string;
  province?: string;
  district?: string;
  ward?: string;
  village?: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
  hot?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DealType {
  id: string;
  name: string;
}

interface Product {
  id: string;
  authorName: string;
  name: string;
  description: string;
  phone?: string;
  price: string;
  thumbnail_url?: string;
  images: ProductImage[];
  user_id: string;
  post_type_id: string;
  dealType: DealType;
  category_id: string;
  category: Category;
  sub_category_id: string | null;
  category_change_id?: string | null;
  sub_category_change_id?: string | null;

  category_change?: {
    id: string;
    name: string;
    image?: string;
  };
  sub_category_change?: {
    id: string;
    name: string;
    parent_category_id?: string;
    source_table?: string;
    source_id?: string;
  };
  postType: PostType;
  productType: ProductType;
  condition: Condition;
  address_json: AddressJson;
  status_id: string;
  visibility_type: string;
  group_id?: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  image?: any;
  location?: string;
  time?: string;
  tag?: string;
  imageCount?: number;
  isFavorite?: boolean; // Giữ lại thuộc tính này (tùy chọn)
}

type RootStackParamList = {
  ProductDetail: { product: Product };
  ChatRoomScreen: {
    product: Product;
    otherUserId: number;
    otherUserName?: string;
    currentUserId: number;
    currentUserName: string;
  };
};

type ProductDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "ProductDetail"
>;
type ProductDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProductDetail"
>;

export default function ProductDetailScreen() {
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const route = useRoute<ProductDetailScreenRouteProp>();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();

  const product = route.params?.product || {};

  // ****************** LOGIC LƯU SẢN PHẨM MỚI ******************
  const [isFavorite, setIsFavorite] = useState<boolean>(
    product.isFavorite || false
  );
  const [loadingFavorite, setLoadingFavorite] = useState<boolean>(false);

  // 1. Hàm kiểm tra trạng thái lưu khi tải trang
  const checkFavoriteStatus = async () => {
    if (!product.id || !currentUser?.id) return;
    try {
      // ✅ Gọi endpoint mới /favorites/by-user/:userId để lấy danh sách ID
      // Sau đó kiểm tra xem product.id có trong danh sách đó không.
      const response = await axios.get(
        `${path}/favorites/by-user/${currentUser.id}`
      );
      const favoriteIds: string[] = response.data.map((id: number | string) => id.toString());
      
      setIsFavorite(favoriteIds.includes(product.id));
    } catch (error) {
      console.log("Không thể kiểm tra trạng thái lưu ban đầu.", error);
    }
  };

  // 2. Hàm xử lý Lưu/Bỏ lưu (TOGGLE)
  const handleToggleFavorite = async () => {
    if (!product.id || !currentUser?.id) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để lưu sản phẩm.");
        return;
    }
    if (loadingFavorite) return;
    
    setLoadingFavorite(true);

    try {
      // ✅ Gửi yêu cầu đúng route và body theo NestJS Controller: POST /favorites/toggle
      const response = await axios.post(`${path}/favorites/toggle`, {
        // Tên trường phải khớp: userId và productId
        userId: currentUser.id, 
        productId: Number(product.id), // Đảm bảo gửi kiểu Number theo yêu cầu của ParseIntPipe
      });

      // Backend trả về { favorited: true/false, message: ... }
      const { favorited, message } = response.data;
      
      // Cập nhật state và hiển thị thông báo
      setIsFavorite(favorited);
      Alert.alert("Thông báo", message);
      
    } catch (error) {
      const err = error as any;
      console.error("Lỗi API Lưu/Bỏ lưu:", err.response?.data || err.message);
      
      // Thêm kiểm tra lỗi 404/Network để giúp debug
      const status = err.response?.status;
      if (status === 404 || status === 0) {
        Alert.alert("Lỗi kết nối", "Kiểm tra IP/Port hoặc route Backend /favorites/toggle");
      } else {
        Alert.alert("Lỗi", "Không thể thay đổi trạng thái lưu sản phẩm.");
      }
      
    } finally {
      setLoadingFavorite(false);
    }
  };

  // ****************** LOGIC BÌNH LUẬN VÀ KHÁC (Giữ nguyên) ******************
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("userName");
      if (id && name) {
        setCurrentUser({ id: Number(id), name });
      }
    })();
  }, []);

  useEffect(() => {
    // 3. Gọi hàm kiểm tra trạng thái lưu khi currentUser/product.id thay đổi
    if (currentUser?.id && product.id) {
        checkFavoriteStatus();
    }
  }, [product.id, currentUser?.id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const res = await axios.get(`${path}/comments/${product.id}`);
        setComments(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bình luận:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    if (product.id) fetchComments();
  }, [product.id]);

  const handleCall = async () => {
    if (product.phone) {
      try {
        await Linking.openURL(`tel:${product.phone}`);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể thực hiện cuộc gọi.");
      }
    }
  };

  const productImages: ProductImage[] =
    product.images && product.images.length > 0
      ? product.images.map((img) => ({
          ...img,
          id: img.id.toString(),
          product_id: img.product_id.toString(),
          image_url:
            img.image_url.startsWith("file://") ||
            img.image_url.startsWith("http")
              ? img.image_url
              : `${path}${img.image_url}`,
        }))
      : [
          {
            id: "1",
            product_id: product.id || "1",
            name: "Default",
            image_url:
              product.image ||
              "https://via.placeholder.com/400x300?text=No+Image",
            created_at: new Date().toISOString(),
          },
        ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSend = async () => {
    if (isSending || comment.trim() === "") return;

    if (!product?.id) {
      Alert.alert("Lỗi", "Không xác định được sản phẩm để bình luận.");
      return;
    }

    try {
      setIsSending(true);
      const res = await axios.post(`${path}/comments`, {
        product_id: Number(product.id),
        user_id: currentUser?.id || 1, // Dùng currentUser.id
        content: comment.trim(),
      });

      setComments((prev) => [...prev, res.data]);
      setComment("");
    } catch (error) {
      Alert.alert("Lỗi", "Không gửi được bình luận. Vui lòng thử lại!");
      console.error("Gửi bình luận lỗi:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleChatPress = async () => {
    if (!currentUser) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để chat.");
        return;
    }

    try {
      const res = await fetch(`${path}/products/${product.id}`);
      const data = await res.json();

      navigation.navigate("ChatRoomScreen", {
        product: product,
        otherUserId: Number(data.user_id),
        otherUserName: data.author_name || "Người bán",
        currentUserId: Number(currentUser.id),
        currentUserName: currentUser.name,
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy thông tin người bán");
    }
  };

  const renderImageItem = ({ item }: { item: ProductImage }) => {
    const imageSource = { uri: item.image_url };
    return (
      <View style={{ width, height: 280 }}>
        <Image
          source={imageSource}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
    );
  };
  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  return (
    <View className="flex-1 bg-white mt-5">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Ảnh sản phẩm - Swipe horizontal để xem hết ảnh */}
        <View className="relative">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-3 left-3 bg-white p-2 rounded-full z-10 shadow-md"
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
          <FlatList
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            decelerationRate="fast"
            keyExtractor={(item) => item.id}
            renderItem={renderImageItem}
            getItemLayout={getItemLayout}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              if (index >= 0 && index < productImages.length) {
                setCurrentImageIndex(index);
              }
            }}
          />
          {/* ✅ Dots indicator */}
          <View className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex-row items-center">
            {productImages.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </View>
          {/* Counter 1/N */}
          <View className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-1">
            <Text className="text-white text-sm font-medium">
              {currentImageIndex + 1}/{productImages.length}
            </Text>
          </View>
          {/* Nút Lưu Sản Phẩm MỚI */}
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={loadingFavorite}
            className="absolute top-4 right-4 bg-white px-3 py-2 rounded-full flex-row items-center shadow"
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? "red" : "black"}
            />
            <Text className="ml-1 text-xs text-black">
              {loadingFavorite
                ? "..."
                : isFavorite
                ? "Đã lưu"
                : "Lưu"}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="bg-green-500 self-end rounded-md ">
          <TouchableOpacity
            onPress={handleChatPress}
            className="bg-green-500 self-end rounded-md"
          >
            <Text className="text-white px-4 py-1 font-bold">Chat</Text>
          </TouchableOpacity>
        </View>
        <View className="px-4 py-3 pb-12">
          {/* Tiêu đề */}
          <Text className=" text-xl font-bold mb-2">
            {product.name || "Sản phẩm mặc định"}
          </Text>
          <Text
            className="text-gray-800 text-sm font-medium mb-2"
            style={{ flexShrink: 1, flexWrap: "wrap" }}
          >
            {product.tag || "Chưa rõ"}
          </Text>
          {/* Giá */}
          <Text className="text-red-600 text-xl font-bold mb-2">
            {product.dealType?.name === "Miễn phí"
              ? "Miễn phí"
              : product.dealType?.name === "Trao đổi"
              ? "Trao đổi"
              : parseFloat(product.price || "0") > 0
              ? `${parseFloat(product.price).toLocaleString()} đ`
              : null}
          </Text>

          {/* Địa chỉ */}
          <Text className="text-gray-500 text-sm mb-1">
            📍{" "}
            {product.address_json?.full ||
              product.location ||
              "Chưa rõ địa chỉ"}
          </Text>
          <Text className="text-gray-400 text-xs mb-4">
            {product.created_at
              ? `Đăng ${new Date(product.created_at).toLocaleDateString(
                  "vi-VN",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}`
              : product.time || "1 tuần trước"}
          </Text>

          {/* Thông tin shop */}
          <TouchableOpacity /* onPress={() => navigation.navigate("UserDetail")} */
          >
            <View className="flex-row items-center mt-4">
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                className="w-12 h-12 rounded-full"
              />
              <View className="ml-3 flex-1">
                <Text className="font-semibold">Người dùng</Text>
                <Text className="text-gray-500 text-xs">đã bán 1 lần</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-yellow-500 font-bold">4.1 ★</Text>
                <Text className="ml-1 text-gray-500 text-xs">
                  (14 đánh giá)
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Mô tả chi tiết */}
          <View className="my-3 border-t border-b border-gray-300 px-3 py-3 bg-white rounded-lg">
            <Text className="text-lg font-bold mb-2">Mô tả chi tiết</Text>
            <Text className="text-gray-700 leading-6 text-sm">
              {product.description || "Mô tả sản phẩm..."}
            </Text>
          </View>

          {/* Số điện thoại */}
          <View className="mb-6">
            {product.phone && (
              <View className="flex-row items-center justify-between bg-gray-100 px-4 py-2 rounded-full mt-4 border border-gray-200">
                <Text className="text-sm font-semibold text-gray-800">
                  {isPhoneVisible
                    ? product.phone
                    : `${product.phone.substring(0, 4)}******`}
                </Text>

                <TouchableOpacity
                  onPress={
                    isPhoneVisible ? handleCall : () => setIsPhoneVisible(true)
                  }
                  className="bg-blue-500 px-4 py-1 rounded-full"
                >
                  <Text className="text-sm font-semibold text-white">
                    {isPhoneVisible ? "Gọi ngay" : "Hiện số"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Thông tin chi tiết */}
          <View className="mb-6 px-4">
            <Text className="text-xl font-bold mb-4">Thông tin chi tiết</Text>

            <View className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Tên sản phẩm */}
              <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Tên sản phẩm</Text>
                <Text
                  className="text-gray-800 text-sm font-medium"
                  style={{ flexShrink: 1, flexWrap: "wrap" }}
                >
                  {product.name || "Chưa rõ"}
                </Text>
              </View>
              {/* Loại bài đăng */}
              <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Loại bài đăng</Text>
                <Text
                  className="text-gray-800 text-sm font-medium"
                  style={{ flexShrink: 1, flexWrap: "wrap" }}
                >
                  {product.postType?.name || "Chưa rõ"}
                </Text>
              </View>
              {/* Loại giao dịch */}
              <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Loại giao dịch</Text>
                <Text
                  className="text-gray-800 text-sm font-medium"
                  style={{ flexShrink: 1, flexWrap: "wrap" }}
                >
                  {product.dealType?.name || "Chưa rõ"}
                </Text>
              </View>

              {/* Danh mục trao đổi */}
              {product?.dealType?.name === "Trao đổi" &&
                !!product?.category_change?.name &&
                !!product?.sub_category_change?.name && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">
                      Danh mục trao đổi
                    </Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.category_change?.name} -{" "}
                      {product.sub_category_change?.name}
                    </Text>
                  </View>
                )}

              {/* Loại sản phẩm */}
              <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Loại sản phẩm</Text>
                <Text
                  className="text-gray-800 text-sm font-medium"
                  style={{ flexShrink: 1, flexWrap: "wrap" }}
                >
                  {product.productType?.name || "Chưa rõ"}
                </Text>
              </View>

              {/* Tình trạng */}
              <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Tình trạng</Text>
                <Text
                  className="text-gray-800 text-sm font-medium"
                  style={{ flexShrink: 1, flexWrap: "wrap" }}
                >
                  {product.condition?.name || "Chưa rõ"}
                </Text>
              </View>

              {/* Số lượng ảnh */}
              <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Số lượng ảnh</Text>
                <Text
                  className="text-gray-800 text-sm font-medium"
                  style={{ flexShrink: 1, flexWrap: "wrap" }}
                >
                  {product.images?.length || product.imageCount || 0} ảnh
                </Text>
              </View>

              {/* Địa chỉ */}
              {product.address_json?.full && (
                <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-gray-600 text-sm">Địa chỉ</Text>
                  <Text
                    className="text-gray-800 text-sm font-medium"
                    style={{ flexShrink: 1, flexWrap: "wrap" }}
                  >
                    {product.address_json.full}
                  </Text>
                </View>
              )}

              {/* Người đăng */}
              {product.authorName && (
                <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-gray-600 text-sm">Người đăng</Text>
                  <Text
                    className="text-gray-800 text-sm font-medium"
                    style={{ flexShrink: 1, flexWrap: "wrap" }}
                  >
                    {product.authorName}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Bình luận */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-3">Bình luận</Text>

            {loadingComments ? (
              <Text>Đang tải bình luận...</Text>
            ) : comments.length > 0 ? (
              comments.map((c) => (
                <View key={c.id} className="flex-row items-start mb-4">
                  <Image
                    source={{
                      uri: c.user?.image
                        ? `${path}${c.user.image}`
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                    }}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="ml-3 flex-1 bg-gray-100 px-3 py-2 rounded-2xl">
                    <Text className="font-semibold text-sm">
                      {c.user?.fullName || "Người dùng"}
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      {c.content}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {new Date(c.created_at).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-sm mb-4">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </Text>
            )}

            {/* Ô nhập + nút gửi */}
            <View className="flex-row items-center border border-gray-300 rounded-full px-3 py-2 bg-white">
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Bình luận..."
                editable={!isSending}
                className="flex-1 px-2 text-sm"
              />

              <TouchableOpacity
                onPress={handleSend}
                disabled={isSending}
                className={`ml-2 px-4 py-2 rounded-full ${
                  isSending ? "bg-gray-400" : "bg-blue-500"
                }`}
              >
                {isSending ? (
                  <Text className="text-white font-semibold text-sm">
                    Đang gửi...
                  </Text>
                ) : (
                  <Text className="text-white font-semibold text-sm">Gửi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}