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
import { useRoute, RouteProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import "../../global.css";
import { path } from "../../config";
import axios from "axios";

const { width } = Dimensions.get("window");

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
  categoryChange_id?: string | null;
  subCategoryChange_id?: string | null;

  // Thêm đây
  categoryChange?: {
    id: string;
    name: string;
    image?: string;
  };
  subCategoryChange?: {
    id: string;
    name: string;
    parent_category_id?: string;
    source_table?: string;
    source_id?: string;
  };

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
  isFavorite?: boolean;
}

type RootStackParamList = {
  ProductDetail: { product: Product };
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
  const route = useRoute<ProductDetailScreenRouteProp>();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();

  const product = route.params?.product || {}; // ✅ Dùng trực tiếp từ Home (có images array)
  const tagText = product.tag || "Chưa có tag";

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const res = await axios.get(`${path}/comments/${product.id}`);
        // API trả về mảng comments
        setComments(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bình luận:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    if (product.id) fetchComments();
  }, [product.id]);

  useEffect(() => {
    console.log(
      "Product nhận được ở màn hình Detail:",
      JSON.stringify(product, null, 2)
    );
  }, [product]);

  const [isPhoneVisible, setIsPhoneVisible] = useState(false);

  const handleCall = async () => {
    if (product.phone) {
      // Kiểm tra SĐT có tồn tại không
      try {
        await Linking.openURL(`tel:${product.phone}`);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể thực hiện cuộc gọi.");
      }
    }
  };
  console.log({
    product_id: Number(product.id),
    user_id: 1,
    content: comment.trim(),
  });

  // ✅ Hiển thị hết ảnh từ product.images (4 ảnh nếu có), fallback thumbnail nếu rỗng
  const productImages: ProductImage[] =
    product.images && product.images.length > 0
      ? product.images.map((img) => ({
          ...img,
          id: img.id.toString(),
          product_id: img.product_id.toString(),
          // ✅ Fix URL: file:// local OK, relative prepend path nếu cần
          image_url:
            img.image_url.startsWith("file://") ||
            img.image_url.startsWith("http")
              ? img.image_url
              : `${path}${img.image_url}`, // Prepend nếu /uploads/...
        })) // Cast string nếu cần
      : [
          {
            id: "1",
            product_id: product.id || "1",
            name: "Default",
            image_url:
              product.image ||
              "https://via.placeholder.com/400x300?text=No+Image", // Thumbnail fallback
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
      setIsSending(true); // 🟡 Bắt đầu gửi
      const res = await axios.post(`${path}/comments`, {
        product_id: Number(product.id),
        user_id: 1,
        content: comment.trim(),
      });

      setComments((prev) => [...prev, res.data]);
      setComment("");
    } catch (error) {
      Alert.alert("Lỗi", "Không gửi được bình luận. Vui lòng thử lại!");
      console.error("Gửi bình luận lỗi:", error);
    } finally {
      setIsSending(false); // 🟢 Cho phép gửi lại
    }
  };

  // ✅ Render dots indicator (cho tất cả ảnh)
  const renderDots = () => (
    <View className="flex-row items-center justify-center mt-2">
      {productImages.map((_, index) => (
        <View
          key={index}
          className={`w-2 h-2 rounded-full mx-1 ${index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"}`}
        />
      ))}
    </View>
  );

  // ✅ Render item ảnh (hiển thị từng ảnh trong array)
  const renderImageItem = ({ item }: { item: ProductImage }) => {
    const imageSource = { uri: item.image_url }; // ✅ URL đã fix ở trên
    // console.log(
    //   "Product nhận được ở màn hình Detail:",
    //   JSON.stringify(product, null, 2)
    // );
console.log(">>> productType:", product.productType);

    return (
      <View style={{ width, height: 280 }}>
        <Image
          source={imageSource}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain" // ✅ Sửa: "contain" để giữ nét, full ảnh không crop, cùng kích thước frame nhưng scale fit
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
            onPress={() => navigation.goBack()} // ✅ Nút back để quay lại screen trước
            className="absolute top-3 left-3 bg-white p-2 rounded-full z-10 shadow-md"
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
          <FlatList
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width} // ✅ Snap full width
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
          {/* ✅ Dots indicator - Di chuyển ra ngoài, absolute dưới ảnh, luôn visible */}
          <View className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex-row items-center">
            {productImages.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"}`}
              />
            ))}
          </View>
          {/* Counter 1/N (1/4 nếu 4 ảnh) */}
          <View className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-1">
            <Text className="text-white text-sm font-medium">
              {currentImageIndex + 1}/{productImages.length}
            </Text>
          </View>
          {/* Nút Lưu */}
          <TouchableOpacity className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex-row items-center border border-gray-300">
            <Ionicons
              name={product.isFavorite ? "heart" : "heart-outline"}
              size={16}
              color={product.isFavorite ? "red" : "black"}
            />
            <Text className="ml-1 text-xs text-black">Lưu</Text>
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
              {product.dealType?.name === "Trao đổi" &&
                product.categoryChange &&
                product.subCategoryChange && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">
                      Danh mục trao đổi
                    </Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.categoryChange.name} -{" "}
                      {product.subCategoryChange.name}
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
