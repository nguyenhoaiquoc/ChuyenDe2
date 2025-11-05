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
import "../../global.css";
import { path } from "../../config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Comment,
  Product,
  ProductDetailScreenNavigationProp,
  ProductDetailScreenRouteProp,
  ProductImage,
  User,
} from "../../types";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sellerAvatar, setSellerAvatar] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("userName");
      if (id && name) {
        setCurrentUser({ id: Number(id), name });
      }
    })();
  }, []);

  const route = useRoute<ProductDetailScreenRouteProp>();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();

  const { product: routeProduct, isApproved: routeIsApproved } =
    route.params || {};
  const product: Product = routeProduct || ({} as Product);
  // Mặc định là 'true' nếu không được truyền (cho các màn hình khác)
  const isApproved = routeIsApproved ?? true;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const fetchFavoriteData = async () => {
      try {
        const countRes = await axios.get(
          `${path}/favorites/${product.id}/count`
        );
        setFavoriteCount(countRes.data.count || 0);

        if (currentUser?.id) {
          const statusRes = await axios.get(
            `${path}/favorites/check/${product.id}?userId=${currentUser.id}`
          );
          setIsFavorite(statusRes.data.isFavorite || false);
        } else {
          setIsFavorite(false);
        }
      } catch (err) {
        console.log("Lỗi lấy dữ liệu yêu thích:", err);
      }
    };

    if (product.id && isApproved) {
      fetchFavoriteData();
    }
  }, [product.id, currentUser, isApproved]);

  const handleToggleFavorite = async () => {
    if (!currentUser?.id) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để yêu thích sản phẩm.");
      return;
    }

    try {
      await axios.post(`${path}/favorites/toggle/${product.id}`, {
        userId: currentUser.id,
      });

      const [countRes, statusRes] = await Promise.all([
        axios.get(`${path}/favorites/${product.id}/count`),
        axios.get(
          `${path}/favorites/check/${product.id}?userId=${currentUser.id}`
        ),
      ]);

      setFavoriteCount(countRes.data.count || 0);
      setIsFavorite(statusRes.data.isFavorite || false);
    } catch (err) {
      console.log("Lỗi toggle yêu thích detail:", err);
    }
  };

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

    if (product.id && isApproved) fetchComments();
  }, [product.id, isApproved]);

  useEffect(() => {}, [product]);

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

      // Lấy user_id từ AsyncStorage
      const userIdStr = await AsyncStorage.getItem("userId");
      if (!userIdStr) {
        Alert.alert("Thông báo", "Bạn phải đăng nhập để bình luận.");
        setIsSending(false);
        return;
      }
      const userId = Number(userIdStr);

      const res = await axios.post(`${path}/comments`, {
        product_id: Number(product.id),
        user_id: userId, // dùng user thật
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
  // useEffect(() => {
  //   console.log("Product detail:", product);
  // }, []);

  const handleChatPress = async () => {
    try {
      if (!currentUser) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để chat.");
        return;
      }

      const tokenValue = await AsyncStorage.getItem("token");
      if (!tokenValue) {
        Alert.alert("Lỗi", "Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }

      const sellerId = String(product.user_id);
      const buyerId = String(currentUser.id);

      // 🟢 Gọi API mở hoặc tạo phòng chat (đã sửa backend nhận product_id)
      const response = await openOrCreateRoom(tokenValue, {
        seller_id: sellerId,
        buyer_id: buyerId,
        room_type: "PAIR",
        product_id: String(product.id), // ✅ backend giờ nhận product_id
      });

      const room = response.room ?? response;
      console.log("🟢 Room nhận được:", room);

      // ✅ Xác định người còn lại trong phòng (người bán)
      const otherUserId =
        sellerId === String(currentUser.id) ? buyerId : sellerId;
      const otherUserName = product.authorName || "Người bán";
      const otherUserAvatar =
        product.user?.avatar ||
        product.seller?.avatar ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // ✅ fallback

      console.log("🚀 Điều hướng ChatRoom với token:", tokenValue);
      navigation.navigate("ChatRoomScreen", {
        roomId: room.id,
        product,
        otherUserId,
        otherUserName,
        otherUserAvatar,
        currentUserId: currentUser.id,
        currentUserName: currentUser.name,
        token: tokenValue,
      });
    } catch (error) {
      console.error("❌ Lỗi mở phòng chat:", error);
      Alert.alert("Lỗi", "Không thể mở phòng chat. Vui lòng thử lại!");
    }
  };

  // ✅ Render item ảnh (hiển thị từng ảnh trong array)
  const renderImageItem = ({ item }: { item: ProductImage }) => {
    const imageSource = { uri: item.image_url }; // ✅ URL đã fix ở trên
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

  // 🧩 Gọi API tạo hoặc lấy phòng chat
  async function openOrCreateRoom(
    token: string,
    payload: {
      seller_id: string;
      buyer_id: string;
      room_type: "PAIR";
      product_id?: string;
    }
  ) {
    console.log("🪙 Token gửi đi:", token);
    console.log("📤 Payload gửi:", payload);

    try {
      const authHeader = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      const res = await axios.post(`${path}/chat/room`, payload, {
        headers: { Authorization: authHeader },
      });
      console.log("🧾 Header gửi đi:", authHeader);

      console.log("💬 Phản hồi từ server:", res.data);
      return res.data; // Có thể là { room: {...} } hoặc {...}
    } catch (err: any) {
      console.log("❌ Lỗi chat:", err.response?.status, err.response?.data);
      throw err;
    }
  }

  const rawPrice = product.price?.toString().replace(/[^\d]/g, "");
  const priceNumber = Number(rawPrice);

  const formatAgeRangeName = (text: string) => {
    if (!text) return "";
    const words = text.split(" ");
    const lines = [];
    for (let i = 0; i < words.length; i += 6) {
      lines.push(words.slice(i, i + 6).join(" "));
    }
    return lines.join("\n");
  };
  useEffect(() => {
    const fetchSellerAvatar = async () => {
      // Chỉ chạy khi có product.user_id
      if (!product.user_id) return;

      try {
        // Dùng user_id của sản phẩm để gọi API lấy thông tin người bán
        const res = await axios.get(`${path}/users/${product.user_id}`);

        // Dùng key 'image' (giống hệt trang UserScreen của bạn)
        if (res.data?.image) {
          setSellerAvatar(res.data.image);
        }
      } catch (err) {
        console.log("Lỗi lấy avatar người bán:", err);
      }
    };

    fetchSellerAvatar();
  }, [product.user_id]);
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Ảnh sản phẩm */}
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
          {isApproved && (
            <TouchableOpacity
              onPress={handleToggleFavorite}
              className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex-row items-center border border-gray-300"
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={16}
                color={isFavorite ? "red" : "black"}
              />
              <Text className="ml-1 text-xs text-black">
                {isFavorite ? "Đã lưu" : "Lưu"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* ✅ Ẩn nút Chat nếu sản phẩm của chính mình */}
        {currentUser &&
        Number(product.user_id) === Number(currentUser.id) ? null : (
          <View className="bg-green-500 self-end rounded-md my-2 mr-4">
            <TouchableOpacity
              onPress={handleChatPress}
              className="bg-green-500 self-end rounded-md"
            >
              <Text className="text-white px-4 py-1 font-bold">Chat</Text>
            </TouchableOpacity>
          </View>
        )}

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

          <View className="flex-row justify-between items-center mb-2">
            {/* Giá  */}
            <Text className="text-red-600 text-xl font-bold">
              {product.dealType?.name === "Miễn phí"
                ? "Miễn phí"
                : product.dealType?.name === "Trao đổi"
                  ? "Trao đổi"
                  : priceNumber > 0
                    ? `${priceNumber.toLocaleString("vi-VN")} đ`
                    : "Liên hệ"}
            </Text>

            {/* Tim */}
            {isApproved && (
              <TouchableOpacity
                className="flex-row items-center"
                onPress={handleToggleFavorite}
              >
                <Text className="mr-1 text-gray-700">{favoriteCount}</Text>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? "red" : "#666"}
                />
              </TouchableOpacity>
            )}
          </View>

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
          <TouchableOpacity
            onPress={() => {
              if (product.user_id) {
                navigation.navigate("UserDetail", {
                  userId: product.user_id,
                  productId: product.id,
                  product: product,
                });
              } else {
                Alert.alert("Lỗi", "Không tìm thấy ID người bán.");
              }
            }}
          >
            <View className="flex-row items-center mt-4">
              <Image
                source={{
                  uri: sellerAvatar
                    ? sellerAvatar.startsWith("http")
                      ? sellerAvatar
                      : `${path}${sellerAvatar}`
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                className="w-12 h-12 rounded-full"
              />
              <View className="ml-3 flex-1">
                <Text className="font-semibold">
                  {product.authorName || "Người dùng"}
                </Text>
                <Text className="text-gray-500 text-xs">đã bán 1 lần</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-yellow-500 font-bold">4.1 ★</Text>
                <Text className="text-gray-500 text-xs">(14 đánh giá)</Text>
              </View>
            </View>
          </TouchableOpacity>
          {/* Mô tả chi tiết */}
          <View className="my-3 border-t border-b border-gray-300 px-3 py-3 bg-white rounded-lg">
            <Text className="text-lg font-bold mb-2">Mô tả chi tiết</Text>
            <Text className="text-gray-700 leading-6 text-lg">
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

              {/* Giống thú cưng */}
              {product.breed?.name && (
                <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-gray-600 text-sm">Giống</Text>
                  <Text
                    className="text-gray-800 text-sm font-medium"
                    style={{ flexShrink: 1, flexWrap: "wrap" }}
                  >
                    {product.breed.name}
                  </Text>
                </View>
              )}

              {/* Độ tuổi */}
              {product.ageRange?.name && (
                <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-gray-600 text-sm">Độ tuổi</Text>
                  <Text
                    className="text-gray-800 text-sm font-medium"
                    style={{ flexShrink: 1, flexWrap: "wrap" }}
                  >
                    {formatAgeRangeName(product.ageRange.name)}
                  </Text>
                </View>
              )}

              {/* Giới tính */}
              {product.gender?.name && (
                <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-gray-600 text-sm">Giới tính</Text>
                  <Text
                    className="text-gray-800 text-sm font-medium"
                    style={{ flexShrink: 1, flexWrap: "wrap" }}
                  >
                    {product.gender.name}
                  </Text>
                </View>
              )}
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
                      {formatAgeRangeName(
                        `${product.category_change?.name || ""} - ${product.sub_category_change?.name || ""}`
                      )}
                    </Text>
                  </View>
                )}

              {/* Loại sản phẩm */}
              {product.productType?.name &&
                product.category?.name !== "Tài liệu khoa" && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Loại sản phẩm</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.productType.name}
                    </Text>
                  </View>
                )}

              {/* Hãng */}
              {product.brand?.name &&
                [38, 39, 40, 46, 60, 61, 62].includes(
                  Number(product.subCategory?.id)
                ) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Hãng</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.brand.name}
                    </Text>
                  </View>
                )}

              {/* Dòng */}
              {product.productModel?.name && (
                <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-gray-600 text-sm">Dòng</Text>
                  <Text
                    className="text-gray-800 text-sm font-medium"
                    style={{ flexShrink: 1, flexWrap: "wrap" }}
                  >
                    {product.productModel.name}
                  </Text>
                </View>
              )}

              {/* Màu sắc */}
              {product.color?.name &&
                [38, 39, 40, 41, 60, 61, 62].includes(
                  Number(product.subCategory?.id)
                ) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Màu sắc</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.color.name}
                    </Text>
                  </View>
                )}

              {/* Dung lượng */}
              {product.capacity?.name &&
                [38, 39, 40, 41].includes(Number(product.subCategory?.id)) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Dung lượng</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.capacity.name}
                    </Text>
                  </View>
                )}

              {/* Bảo hành */}
              {product.warranty?.name &&
                [
                  38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 60, 61, 62,
                ].includes(Number(product.subCategory?.id)) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Bảo hành</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.warranty.name}
                    </Text>
                  </View>
                )}

              {/* Bộ vi xử lý */}
              {product.processor?.name &&
                (product.subCategory?.id == 40 ||
                  product.subCategory?.id == 41) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Bộ vi xử lý</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.processor.name}
                    </Text>
                  </View>
                )}

              {/* RAM */}
              {product.ramOption?.name &&
                (product.subCategory?.id == 40 ||
                  product.subCategory?.id == 41) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">RAM</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.ramOption.name}
                    </Text>
                  </View>
                )}

              {/* Loại ổ cứng */}
              {product.storageType?.name &&
                (product.subCategory?.id == 40 ||
                  product.subCategory?.id == 41) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Loại ổ cứng</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.storageType.name}
                    </Text>
                  </View>
                )}

              {/* Card màn hình */}
              {product.graphicsCard?.name &&
                (product.subCategory?.id == 40 ||
                  product.subCategory?.id == 41) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Card màn hình</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.graphicsCard.name}
                    </Text>
                  </View>
                )}

              {/* Chất liệu */}
              {product.material?.name &&
                (product.subCategory?.id == 23 ||
                  product.subCategory?.id == 24) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Chất liệu</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.material.name}
                    </Text>
                  </View>
                )}
              {/* Kích cỡ */}
              {product.size?.name &&
                [25, 39, 40, 41, 44, 53, 54, 55, 56, 57].includes(
                  Number(product.subCategory?.id)
                ) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Kích cỡ</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.size.name}
                    </Text>
                  </View>
                )}

              {/* Xuất xứ */}
              {product.origin?.name &&
                product.category?.name !== "Tài liệu khoa" && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Xuất xứ</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.origin.name}
                    </Text>
                  </View>
                )}
              {/* Tác giả */}
              {product.category?.name === "Tài liệu khoa" && product.author && (
                <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-gray-600 text-sm">
                    Tác giả/ Người biên soạn
                  </Text>
                  <Text
                    className="text-gray-800 text-sm font-medium"
                    style={{ flexShrink: 1, flexWrap: "wrap" }}
                  >
                    {product.author}
                  </Text>
                </View>
              )}
              {/* Dung tích xe (Xe máy) */}
              {product.engineCapacity?.name &&
                product.subCategory?.id == 60 && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Dung tích xe</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.engineCapacity.name}
                    </Text>
                  </View>
                )}

              {/* Số km đã đi (Xe cộ) */}
              {product.mileage != null &&
                [60, 61, 62].includes(Number(product.subCategory?.id)) && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Số km đã đi</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {Number(product.mileage).toLocaleString("vi-VN")} km
                    </Text>
                  </View>
                )}
              {/* Năm xuất bản */}
              {product.year &&
                (product.category?.name === "Tài liệu khoa" || // Tài liệu
                  [60, 61, 62].includes(Number(product.subCategory?.id))) && ( // Xe cộ
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">
                      {product.category?.name === "Tài liệu khoa"
                        ? "Năm xuất bản/ Năm học"
                        : "Năm sản xuất"}
                    </Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.year}
                    </Text>
                  </View>
                )}

              {/* Tình trạng */}
              {product.condition?.name &&
                product.category?.name !== "Thú cưng" && (
                  <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Tình trạng</Text>
                    <Text
                      className="text-gray-800 text-sm font-medium"
                      style={{ flexShrink: 1, flexWrap: "wrap" }}
                    >
                      {product.condition.name}
                    </Text>
                  </View>
                )}

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
          {isApproved && (
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
                          ? c.user.image.startsWith("http")
                            ? c.user.image
                            : `${path}${c.user.image}`
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
                        {new Date(
                          new Date(c.created_at).getTime() + 7 * 60 * 60 * 1000
                        ).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
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
                    <Text className="text-white font-semibold text-sm">
                      Gửi
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
