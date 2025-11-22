import React, { useEffect, useState, useCallback, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ScrollView,
  Text,
  View,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Platform,
  ActionSheetIOS,
  TextInput,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../config";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";

const DEFAULT_AVATAR = require("../../assets/khi.png");
const DEFAULT_COVER = require("../../assets/anhbia.jpg");
interface User {
  id: string;
  name: string;
  image?: string;
  coverImage?: string;
  isFollowing?: boolean;
  followerCount?: number;
  postCount?: number;
  soldCount?: number;
  
}
// Star Rating Component
const StarRating = ({ rating, editable = false, onChange }: any) => (
  <View className="flex-row gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => editable && onChange?.(star)}
        disabled={!editable}
      >
        <MaterialIcons
          name={star <= rating ? "star" : "star-border"}
          size={16}
          color="#facc15"
        />
      </TouchableOpacity>
    ))}
  </View>
);

// Rating Card Component
const RatingCard = ({ rating }: any) => {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 3600) return "Vừa xong";
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return `${Math.floor(seconds / 86400)} ngày trước`;
  };

  return (
    <View className="bg-white p-2 rounded-xl mb-2 border border-gray-100 shadow-sm">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center">
          <Image
            source={
              rating.reviewer.avatar
                ? { uri: rating.reviewer.avatar }
                : DEFAULT_AVATAR
            }
            className="w-8 h-8 rounded-full mr-2"
          />
          <View>
            <Text className="font-semibold text-xxs">
              {rating.reviewer?.name || "Người dùng"}
            </Text>
            <Text className="text-xs text-gray-500">
              {timeAgo(rating.createdAt)}
            </Text>
          </View>
        </View>
        <StarRating rating={rating.stars} editable={false} />
      </View>
      {rating.content && (
        <Text className="text-gray-700 text-xs mt-1">{rating.content}</Text>
      )}
    </View>
  );
};

// Tabs Content
const DisplayingRoute = () => (
  <View className="flex-1 items-center justify-center py-10">
    <Text className="font-semibold text-gray-800">
      Bạn chưa có tin đăng nào
    </Text>
    <TouchableOpacity
      onPress={() => {
        /* Logic điều hướng đến trang đăng tin */
      }}
    >
      <Text className="bg-yellow-400 px-8 rounded-md py-1 mt-2 text-white font-medium">
        Đăng tin Ngay
      </Text>
    </TouchableOpacity>
  </View>
);

const SoldRoute = () => (
  <View className="flex-1 items-center justify-center py-10">
    <Text className="font-semibold text-gray-500">
      Bạn chưa bán sản phẩm nào
    </Text>
    <TouchableOpacity
      onPress={() => {
        /* Logic điều hướng đến trang đăng tin */
      }}
    >
      <Text className="bg-yellow-400 px-8 rounded-md py-1 mt-2 text-white font-medium">
        Đăng tin mới
      </Text>
    </TouchableOpacity>
  </View>
);

const mapProductData = (item: any) => {
  // Xử lý ảnh thumbnail
  const imageUrl = (() => {
    if (!item.thumbnail_url && item.images?.length)
      return item.images[0].image_url;
    const url = item.thumbnail_url || "";
    if (url.startsWith("http")) return url;
    return `${path}${url}`;
  })();

  return {
    ...item,

    authorName:
      item.author_name ||
      item.user?.name ||
      item.user?.fullName ||
      "Người dùng",

    image: imageUrl,
    price: item.price ? item.price.toString() : "0",
    user: item.user || { id: item.user_id, name: "Người dùng" },
  };
};

const RenderProductItem = ({ item, navigation }: any) => {
  const imageUrl =
    item.thumbnail_url ||
    (item.images?.length ? item.images[0].image_url : null);
  const finalImage = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${path}${imageUrl}`
    : null;

  const displayPrice =
    item.dealType?.name === "Miễn phí"
      ? "Miễn phí"
      : item.dealType?.name === "Trao đổi"
        ? "Trao đổi"
        : item.price
          ? `${Number(item.price).toLocaleString("vi-VN")} đ`
          : "Liên hệ";

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100 mx-4"
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Image
        source={
          finalImage ? { uri: finalImage } : require("../../assets/default.png")
        }
        className="w-20 h-20 rounded-lg bg-gray-200"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-center">
        {/* 1. Tên sản phẩm */}
        <Text
          className="text-base font-semibold text-gray-800 mb-1"
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {/* 2. Tên nhóm / Toàn trường */}
        <View className="flex-row items-center mb-1">
          <MaterialIcons
            name={item.group ? "group" : "public"}
            size={12}
            color="#6b7280"
          />
          <Text className="text-xs text-gray-500 ml-1">
            {item.group && item.group.name ? item.group.name : "Toàn trường"}
          </Text>
        </View>

        {/* 3. Tag danh mục */}
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="label" size={12} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>
            {item.tag || item.category?.name || "Khác"}
          </Text>
        </View>

        {/* 4. Giá tiền */}
        <Text className="text-sm font-medium text-indigo-600">
          {displayPrice}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function UserInforScreen({ navigation, route }: any) {
  const layout = useWindowDimensions();
  // const route = useRoute<any>();
  // 1. Lấy userId từ route params
  const { userId: profileUserId } = route.params as { userId: string | number };
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [myRating, setMyRating] = useState<any>(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [ratingContent, setRatingContent] = useState("");
  const [ratingMenuVisible, setRatingMenuVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  const [displayingProducts, setDisplayingProducts] = useState<any[]>([]);
  const [soldProducts, setSoldProducts] = useState<any[]>([]);

  const [reportDescription, setReportDescription] = useState("");
  const [isSendingReport, setIsSendingReport] = useState(false);

  const [routes, setRoutes] = useState([
    { key: "displaying", title: "Đang hiển thị (0)" },
    { key: "sold", title: "Đã bán (0)" },
  ]);

  const renderScene = SceneMap({
    displaying: DisplayingRoute,
    sold: SoldRoute,
  });

  // States
  const [index, setIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const descriptionRef = useRef<TextInput>(null);

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUserId === profileUserId?.toString();

  // 2. Fetch current user id (người đang đăng nhập)
  useEffect(() => {
    AsyncStorage.getItem("userId").then(setCurrentUserId);
  }, []);

   useEffect(() => {
    if (!currentUserId || !profileUserId) return;

    const loadFollowStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${path}/follow/status`, {
          params: { followerId: currentUserId, followingId: profileUserId },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
       setUser((prev: User | null) =>
  prev
    ? {
        ...prev,
        isFollowing: res.data.isFollowing,
        followerCount: res.data.isFollowing
          ? (prev.followerCount || 0) + 1
          : (prev.followerCount || 1) - 1,
      }
    : null
);

      } catch (err) {
        console.log("Check follow status error:", err);
      }
    };

    loadFollowStatus();
  }, [currentUserId, profileUserId]);

  // Data Fetching
  const fetchAllData = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    if (!profileUserId) return; // Đảm bảo có profileUserId

    try {
      const [profileRes, ratingsRes, avgRes, checkRes, productsRes] = await Promise.all([
        axios.get(`${path}/users/${profileUserId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}, // Dùng token nếu có
        }),
        axios.get(`${path}/users/${profileUserId}/ratings`),
        axios.get(`${path}/users/${profileUserId}/rating-average`),
        // Chỉ check rating của mình nếu đang xem hồ sơ người khác (hoặc chính mình) và đã đăng nhập
        token && !isOwnProfile
          ? axios
            .get(`${path}/users/${profileUserId}/check-rating`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: { hasRated: false } }))
          : Promise.resolve({ data: { hasRated: false } }),
      ]);
axios.get(`${path}/products/my-posts/${profileUserId}`),

      setUser(profileRes.data);
      setAvatar(profileRes.data.image || null);
      setCoverImage(profileRes.data.coverImage || null);

      setRatings(ratingsRes.data || []);
      setAverageRating(
        avgRes.data.average ? Number(avgRes.data.average) : null
      );
      setRatingCount(avgRes.data.count || 0);

      // Cập nhật thông tin đánh giá của mình (nếu có)
      if (checkRes.data.hasRated) {
        setMyRating(checkRes.data);
        setSelectedStars(checkRes.data.stars);
        setRatingContent(checkRes.data.content || "");
      } else {
        setMyRating(null);
        setSelectedStars(0);
        setRatingContent("");
      }

      const rawProducts = productsRes?.data;

      const allProducts = Array.isArray(rawProducts)
        ? rawProducts.map(mapProductData)
        : [];

      // Lọc status 2 (Đang hiển thị)
      const active = allProducts.filter(
        (p: any) => p.productStatus?.id === 2 || p.status_id === 2
      );

      // Lọc status 6 (Đã bán)
      const sold = allProducts.filter(
        (p: any) => p.productStatus?.id === 6 || p.status_id === 6
      );

      setDisplayingProducts(active);
      setSoldProducts(sold);

      // Cập nhật tiêu đề Tab kèm số lượng
      setRoutes([
        { key: "displaying", title: `Đang hiển thị (${active.length})` },
        { key: "sold", title: `Đã bán (${sold.length})` },
      ]);
    } catch (err: any) {
      console.log("Lỗi khi lấy dữ liệu:", err.message);
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng.");
    }
  }, [profileUserId, isOwnProfile]); // Thêm isOwnProfile vào dependencies

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData])
  );

  // Helper Function
  function timeSince(dateString: string) {
    if (!dateString) return "Mới tham gia";
    const diff = Date.now() - new Date(dateString).getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0)
      return `${years} năm ${remainingMonths > 0 ? remainingMonths + " tháng" : ""}`;
    if (months > 0) return `${months} tháng`;
    return "Mới tham gia";
  }

  // Follow Function (chỉ thực hiện khi xem hồ sơ người khác)


  // Rating Functions (chỉ cho phép khi xem hồ sơ người khác)
  const handleSubmitRating = async () => {
    if (isOwnProfile || selectedStars === 0)
      return Alert.alert("Lỗi", "Vui lòng chọn số sao");
    const token = await AsyncStorage.getItem("token");
    if (!token) return Alert.alert("Lỗi", "Vui lòng đăng nhập để đánh giá.");

    try {
      const endpoint = `${path}/users/${user.id}/rate`;
      await axios.post(

        endpoint,
        { stars: selectedStars, content: ratingContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert(
        "Thành công",
        myRating ? "Cập nhật thành công" : "Đánh giá thành công"
      );
      setRatingModalVisible(false);
      fetchAllData();
    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Gửi thất bại");
    }
  };

  const deleteMyRating = async () => {
    if (isOwnProfile) return;
    Alert.alert("Xóa đánh giá", "Bạn có chắc chắn?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const token = await AsyncStorage.getItem("token");
          if (!token) return;
          try {
            await axios.delete(`${path}/users/${user.id}/rate`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setMyRating(null);
            fetchAllData();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa đánh giá.");
          }
        },
      },
    ]);
  };

  const handleSendReport = async () => {
    // 0. Cấu hình giới hạn ký tự
    const MAX_LENGTH = 200;

    // 1. Kiểm tra độ dài trước (Tránh lỗi spam hoặc quá tải)
    if (reportDescription.length > MAX_LENGTH) {
      Alert.alert(
        "Nội dung quá dài",
        `Vui lòng nhập tối đa ${MAX_LENGTH} ký tự. Hiện tại: ${reportDescription.length} ký tự.`
      );
      return;
    }

    // 2. Kiểm tra chưa chọn lý do
    if (!reportReason) {
      Alert.alert("Thông báo", "Vui lòng chọn lý do báo cáo.");
      return;
    }

    // 3. Kiểm tra riêng: Nếu chọn "Lý do khác" thì bắt buộc phải nhập chữ
    if (reportReason === "Lý do khác" && !reportDescription.trim()) {
      Alert.alert(
        "Thông báo",
        "Với 'Lý do khác', bạn vui lòng nhập chi tiết vi phạm."
      );
      return;
    }

    const token = await AsyncStorage.getItem("token");
    if (!token || !currentUserId) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để báo cáo.");
      return;
    }

    try {
      setIsSendingReport(true);

      const finalReason = reportDescription.trim()
        ? `${reportReason}: ${reportDescription}`
        : reportReason;

      const payload = {
        reporter_id: Number(currentUserId),
        reported_user_id: Number(user.id),
        reason: finalReason,
      };

      await axios.post(`${path}/reports`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Thành công", "Đã gửi báo cáo tới ban quản trị.");

      setReportReason(null);
      setReportDescription("");
      setReportVisible(false);
    } catch (error: any) {
      console.log("Report Error:", error.response?.data || error);
      const msg =
        error.response?.data?.message || "Có lỗi xảy ra khi gửi báo cáo.";
      Alert.alert("Thất bại", msg);
    } finally {
      setIsSendingReport(false);
    }
  };
  // --- HÀM 1: UPLOAD ẢNH LÊN CLOUDINARY VÀ SERVER ---
  const uploadImage = async (
    field: "image" | "coverImage",
    fileUri: string
  ) => {
    if (!fileUri) return alert("Lỗi: Không có đường dẫn ảnh!");
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");
    if (!userId || !token) return alert("Vui lòng đăng nhập!");
    setIsUploading(true);

    try {
      // 1️⃣ Upload lên Cloudinary
      const cloudinaryUrl =
        "https://api.cloudinary.com/v1_1/dagyeu6h2/image/upload";
      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("upload_preset", "products");

      const cloudinaryResponse = await axios.post(cloudinaryUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = cloudinaryResponse.data.secure_url;
      if (!imageUrl) throw new Error("Không nhận được URL từ Cloudinary");

      // 2️ Gửi URL lên server của bạn
      const serverResponse = await axios.patch(
        `${path}/users/${userId}`,
        { [field]: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = serverResponse.data;
      if (!updatedUser)
        return alert("Upload thành công nhưng không nhận được dữ liệu user!");

      // 3️ Cập nhật state local
      if (field === "image") setAvatar(updatedUser.image);
      if (field === "coverImage") setCoverImage(updatedUser.coverImage);
      setUser(updatedUser);
      alert("Cập nhật ảnh thành công!");
    } catch (err: any) {
      console.log("Upload Error:", err.response?.data || err.message || err);
      alert("Upload thất bại! Kiểm tra kết nối hoặc cấu hình Cloudinary.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- HÀM 2: PICK OR TAKE PHOTO ---
  const pickAndUpload = async (
    field: "image" | "coverImage",
    source: "camera" | "library"
  ) => {
    try {
      let result;
      const options: ImagePicker.ImagePickerOptions = {
        allowsEditing: true,
        quality: 0.8,
        aspect: field === "image" ? [1, 1] : [16, 9],
        mediaTypes: "images",
      };

      if (source === "camera") {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) return alert("Cần quyền camera để chụp ảnh!");
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { granted } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) return alert("Cần quyền truy cập thư viện ảnh!");
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (result.canceled || !result.assets?.[0]?.uri) return;
      const uri = result.assets[0].uri;
      await uploadImage(field, uri);
    } catch (err) {
      console.log("Picker error:", err);
      alert("Lỗi khi chọn/chụp ảnh!");
    }
  };

  // --- HÀM 3: XOÁ ẢNH ---
  const deleteImage = async (field: "image" | "coverImage") => {
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");
    if (!userId) return alert("Vui lòng đăng nhập trước!");
    if (isUploading) return;
    setIsUploading(true);

    try {
      const res = await axios.patch(
        `${path}/users/${userId}`,
        { [field]: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = res.data;
      if (field === "image") setAvatar(updatedUser.image);
      if (field === "coverImage") setCoverImage(updatedUser.coverImage);
      setUser(updatedUser);
      alert("Đã xoá ảnh thành công!");
    } catch (err: any) {
      console.log("Delete Error:", err.response?.data || err);
      alert("Xoá ảnh thất bại!");
    } finally {
      setIsUploading(false);
    }
  };

  // --- HÀM 4: HIỂN THỊ MENU CHỌN ẢNH ---
  const handleImageOptions = (field: "image" | "coverImage") => {
    if (isUploading) return;
    const options = [
      "Chụp ảnh",
      "Chọn ảnh từ thư viện",
      "Xoá ảnh hiện tại",
      "Hủy",
    ];

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
          destructiveButtonIndex: 2,
        },
        (index) => {
          if (index === 0) pickAndUpload(field, "camera");
          if (index === 1) pickAndUpload(field, "library");
          if (index === 2) deleteImage(field);
        }
      );
    } else {
      Alert.alert("Chọn hành động", "", [
        { text: "Chụp ảnh", onPress: () => pickAndUpload(field, "camera") },
        {
          text: "Chọn ảnh từ thư viện",
          onPress: () => pickAndUpload(field, "library"),
        },
        {
          text: "Xoá ảnh hiện tại",
          onPress: () => deleteImage(field),
          style: "destructive",
        },
        { text: "Hủy", style: "cancel" },
      ]);
    }
  };

  // Copy Link
  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(`https://yourapp.com/user/${user?.id}`);
    Alert.alert("Thành công", "Liên kết đã được sao chép");
    setMenuVisible(false);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="flex flex-row gap-6 pl-6 items-center mt-10">
        <FontAwesome
          onPress={() => navigation.goBack()}
          name="arrow-left"
          size={20}
          color="#000"
        />
        <Text className="text-xl font-semibold">
          {user?.nickname || "Đang tải..."}
        </Text>
      </View>

      {/* Ảnh bìa */}
      <View className="w-full h-[100px] relative mt-2">
        <Image
          key={coverImage}
          className="w-full h-full object-cover"
          source={
            coverImage
              ? {
                uri: coverImage.startsWith("http")
                  ? coverImage
                  : `${path}/${coverImage.replace(/\\/g, "/")}`,
              }
              : DEFAULT_COVER
          }
          style={{ backgroundColor: "#d1d5db" }}
        />
        {/* Nút upload/chỉnh sửa ảnh bìa - CHỈ HIỂN THỊ TRÊN HỒ SƠ CỦA MÌNH */}

        {!isOwnProfile && (
          <TouchableOpacity
            onPress={async () => {
              if (!user) return;
              const token = await AsyncStorage.getItem("token");
              if (!token) return Alert.alert("Lỗi", "Vui lòng đăng nhập để theo dõi.");

              try {
                let updatedUser;
                if (user.isFollowing) {
                  // Unfollow
                  await axios.delete(`${path}/users/${user.id}/follow`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  updatedUser = {
                    ...user,
                    isFollowing: false,
                    followerCount: (user.followerCount || 1) - 1,
                  };
                } else {
                  // Follow
                  await axios.post(
                    `${path}/users/${user.id}/follow`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  updatedUser = {
                    ...user,
                    isFollowing: true,
                    followerCount: (user.followerCount || 0) + 1,
                  };
                }
                setUser(updatedUser);
              } catch (err: any) {
                console.log("Follow Error:", err.response?.data || err.message || err);
                Alert.alert("Lỗi", "Không thể thực hiện thao tác theo dõi.");
              }
            }}
            className={`py-2 px-4 rounded-md ${user?.isFollowing ? "bg-gray-400" : "bg-yellow-400"
              }`}
          >
            <Text className="text-white font-medium text-sm">
              {user?.isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Avatar */}
        <View className="w-[60px] h-[60px] absolute -bottom-6 left-5 bg-white p-1 rounded-full">
          <Image
            key={avatar}
            className="w-full h-full object-cover rounded-full"
            source={
              avatar
                ? {
                  uri: avatar.startsWith("http")
                    ? avatar
                    : `${path}/${avatar.replace(/\\/g, "/")}`,
                }
                : DEFAULT_AVATAR
            }
            style={{ backgroundColor: "#d1d5db" }}
          />
          {/* Nút upload/chỉnh sửa avatar - CHỈ HIỂN THỊ TRÊN HỒ SƠ CỦA MÌNH */}
          {isOwnProfile && (
            <TouchableOpacity
              onPress={() => handleImageOptions("image")}
              disabled={isUploading}
              className="absolute right-0 bottom-0 bg-white rounded-full p-1"
            >
              <MaterialIcons name="camera-alt" size={10} color="black" />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading Indicator */}
        {isUploading && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 flex items-center justify-center">
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex flex-row justify-end gap-4 mt-8 mr-4">
        {/* Nút "Theo dõi" - CHỈ HIỂN THỊ TRÊN HỒ SƠ CỦA NGƯỜI KHÁC */}
        {!isOwnProfile && (
  <TouchableOpacity
    onPress={async () => {
      if (!user) return;
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Lỗi", "Vui lòng đăng nhập để theo dõi.");

      try {
        let updatedUser;
        if (user.isFollowing) {
          // Unfollow
          await axios.delete(`${path}/users/${user.id}/follow`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          updatedUser = {
            ...user,
            isFollowing: false,
            followerCount: (user.followerCount || 1) - 1,
          };
        } else {
          // Follow
          await axios.post(
            `${path}/users/${user.id}/follow`,
            {}, // không cần body
            { headers: { Authorization: `Bearer ${token}` } }
          );
          updatedUser = {
            ...user,
            isFollowing: true,
            followerCount: (user.followerCount || 0) + 1,
          };
        }
        setUser(updatedUser);
      } catch (err: any) {
        console.log("Follow Error:", err.response?.data || err.message || err);
        Alert.alert("Lỗi", "Không thể thực hiện thao tác theo dõi.");
      }
    }}
    className={`text-xs p-1 rounded-md px-2 ${user?.isFollowing ? "bg-gray-400" : "bg-yellow-400"}`}
  >
    <Text className="text-white font-medium px-4">
      {user?.isFollowing ? "Đang theo dõi" : "Theo dõi"}
    </Text>
  </TouchableOpacity>
)}


        {/* Nút Menu 3 chấm (dành cho cả hai) */}
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="more-vert" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Tên và Đánh giá */}
      <View className="pl-3 mt-[-10px] flex flex-col gap-2">
        <Text className="font-bold text-lg">{user?.nickname || "..."}</Text>
        <View className="flex-row items-center">
          {averageRating !== null ? (
            <>
              <StarRating rating={Math.round(averageRating)} />
              <Text className="text-sm text-gray-600 ml-2">
                {averageRating.toFixed(1)} ({ratingCount} đánh giá)
              </Text>
            </>
          ) : (
            <Text className="text-sm text-gray-600">Chưa có đánh giá</Text>
          )}
        </View>
        <View className="flex flex-row gap-3">
          <Text className="border-r pr-2 text-xs text-gray-700">
            Người theo dõi: {user?.followerCount || 0}
          </Text>
          <Text className="text-xs text-gray-700">
            Đang theo dõi: {user?.followingCount || 0}
          </Text>
        </View>
      </View>

      {/* Chi tiết người dùng */}
      <View className="pl-3 pr-4 flex flex-col mt-6 gap-3 mb-4">
        {/* PHẦN HIỂN THỊ CỐ ĐỊNH */}
        <View className="flex flex-row gap-2 items-center">
          <MaterialIcons name="chat" size={16} color="gray" />
          <Text className="text-xs text-gray-600">Phản hồi chat: Chưa có</Text>
        </View>
        <View className="flex flex-row gap-2 items-center">
          <MaterialIcons name="access-time" size={16} color="gray" />
          <Text className="text-xs text-gray-600">
            Đã tham gia: {timeSince(user?.createdAt)}
          </Text>
        </View>

        {/* Xác thực (CHỈ HIỂN THỊ CHO CHÍNH MÌNH) */}
        {isOwnProfile && (
          <View className="flex flex-row gap-2 items-center">
            <MaterialIcons name="verified-user" size={16} color="gray" />
            <Text className="text-xs text-gray-600">Đã xác thực:</Text>
            <View className="flex flex-row gap-2 items-center ml-1">
              <TouchableOpacity
                onPress={() => navigation.navigate("VerifyStudentScreen")}
              >
                <Text
                  className={`text-xs ml-1 underline ${user?.is_cccd_verified ? "text-blue-500" : "text-red-500"}`}
                >
                  {user?.is_cccd_verified
                    ? "Xác thực lại"
                    : "Xác thực sinh viên"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="flex flex-row gap-2 items-center">
          <MaterialIcons name="near-me" size={16} color="gray" />
          <Text className="text-xs text-gray-600">
            Địa chỉ: {user?.address_json?.full || "Chưa cung cấp"}
          </Text>
        </View>

        {/* Nút "Viết đánh giá" - CHỈ HIỂN THỊ TRÊN HỒ SƠ NGƯỜI KHÁC VÀ KHI ĐÃ ĐĂNG NHẬP */}
        {!isOwnProfile && currentUserId && (
          <TouchableOpacity
            onPress={() =>
              myRating
                ? setRatingMenuVisible(true)
                : setRatingModalVisible(true)
            }
            className={`py-2 rounded-xl mt-3 ${myRating ? "bg-white border border-yellow-400" : "bg-yellow-400"}`}
          >
            <Text
              className={`text-center font-medium ${myRating ? "text-yellow-500" : "text-white"}`}
            >
              {myRating ? "Đánh giá của bạn" : "Viết đánh giá"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Danh sách đánh giá */}
        {ratings.length > 0 && (
          <View className="px-3 mt-2">
            <Text className="text-base font-semibold mb-2">
              Đánh giá từ người dùng ({ratingCount})
            </Text>
            {ratings.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
          </View>
        )}

        {/* Nút xem thêm/ẩn */}
        <TouchableOpacity
          className="mt-1"
          onPress={() => setShowMore(!showMore)}
        >
          <Text className="text-xs text-yellow-500 font-semibold">
            {showMore ? "Ẩn thông tin" : "Xem thêm thông tin"}
          </Text>
        </TouchableOpacity>

        {/* PHẦN ẨN/HIỆN */}
        {showMore && (
          <View className="flex flex-col gap-3 mt-2">
            {/* Quê quán */}
            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons name="near-me" size={16} color="gray" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">Quê quán:</Text>
                <Text className="text-xs text-gray-800 font-medium">
                  {user?.hometown || "Chưa cập nhật"}
                </Text>
              </View>
            </View>
            {/* Số điện thoại (CHỈ HIỂN THỊ TRÊN HỒ SƠ CỦA MÌNH) */}
            {
              <View className="flex flex-row gap-2 items-center">
                <MaterialIcons name="phone" size={16} color="gray" />
                <View className="flex-1 flex-row justify-between">
                  <Text className="text-xs text-gray-600">Số điện thoại:</Text>
                  <Text className="text-xs text-gray-800 font-medium">
                    {user?.phone || "Chưa cập nhật"}
                  </Text>
                </View>
              </View>
            }
            {/* Tên gợi nhớ */}
            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons name="person-outline" size={16} color="gray" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">Họ và tên:</Text>
                <Text className="text-xs text-gray-800 font-medium">
                  {user?.fullName || "Chưa cập nhật"}
                </Text>
              </View>
            </View>
            {/* CCCD (CHỈ HIỂN THỊ TRÊN HỒ SƠ CỦA MÌNH) */}
            {isOwnProfile && (
              <View className="flex flex-row gap-2 items-center">
                <MaterialIcons name="badge" size={16} color="gray" />
                <View className="flex-1 flex-row justify-between">
                  <Text className="text-xs text-gray-600">CCCD / CMND:</Text>
                  <Text className="text-xs text-gray-800 font-medium">
                    {user?.citizenId
                      ? "******" + user.citizenId.slice(-4)
                      : "Chưa cập nhật"}
                  </Text>
                </View>
              </View>
            )}
            {/* Giới tính */}
            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons name="wc" size={16} color="gray" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">Giới tính:</Text>
                <Text className="text-xs text-gray-800 font-medium">
                  {user?.gender === 1 || user?.gender === "Nam"
                    ? "Nam"
                    : user?.gender === 2 || user?.gender === "Nữ"
                      ? "Nữ"
                      : user?.gender === 3 || user?.gender === "Khác"
                        ? "Khác"
                        : "Chưa cập nhật"}
                </Text>
              </View>
            </View>
            {/* Ngày sinh */}
            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons name="cake" size={16} color="gray" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">Ngày sinh:</Text>
                <Text className="text-xs text-gray-800 font-medium">
                  {user?.dob
                    ? new Date(user.dob).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="mt-8 h-[350px]">
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={(props: any) => (
            <TabBar
              {...props}
              indicatorStyle={{
                backgroundColor: "#facc15",
                height: 3,
                borderRadius: 2,
              }}
              style={{
                backgroundColor: "white",
                elevation: 0,
                shadowOpacity: 0,
              }}
              labelStyle={{
                color: "#000",
                fontWeight: "600",
                textTransform: "none",
                fontSize: 13,
              }}
              activeColor="#000"
              inactiveColor="#9ca3af"
            />
          )}
        />
      </View>

      {/* Modal Rating (Dành cho hồ sơ người khác) */}
      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setRatingModalVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white w-80 rounded-xl p-5 shadow-lg"
          >
            <Text className="text-lg font-semibold text-center mb-5">
              {myRating ? "Chỉnh sửa đánh giá" : "Đánh giá người dùng"}
            </Text>
            <View className="items-center mb-4">
              <StarRating
                rating={selectedStars}
                onChange={setSelectedStars}
                editable
              />
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 h-24 text-sm mb-4"
              placeholder="Nhận xét của bạn (tùy chọn)"
              multiline
              value={ratingContent}
              onChangeText={setRatingContent}
              style={{ textAlignVertical: "top" }}
            />
            <TouchableOpacity
              onPress={handleSubmitRating}
              disabled={selectedStars === 0}
              className={`py-3 rounded-xl mb-3 ${selectedStars === 0 ? "bg-gray-300" : "bg-orange-500 active:bg-orange-600"}`}
            >
              <Text
                className={`text-center font-semibold ${selectedStars === 0 ? "text-gray-500" : "text-white"}`}
              >
                {myRating ? "Cập nhật" : "Gửi đánh giá"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRatingModalVisible(false)}
              className="bg-gray-100 py-2 rounded-xl"
            >
              <Text className="text-center text-gray-700 font-medium">Hủy</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Rating Menu (Dành cho hồ sơ người khác) */}
      <Modal
        visible={ratingMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingMenuVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setRatingMenuVisible(false)}
        >
          <View className="flex-1 justify-center items-center">
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-72"
            >
              <TouchableOpacity
                onPress={() => {
                  setRatingMenuVisible(false);
                  setRatingModalVisible(true);
                }}
                className="px-5 py-4 flex-row items-center gap-3 border-b border-gray-200"
              >
                <MaterialIcons name="edit" size={20} color="#666" />
                <Text className="text-base">Chỉnh sửa đánh giá</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setRatingMenuVisible(false);
                  deleteMyRating();
                }}
                className="px-5 py-4 flex-row items-center gap-3"
              >
                <MaterialIcons
                  name="delete-outline"
                  size={20}
                  color="#ef4444"
                />
                <Text className="text-base text-red-500">Xóa đánh giá</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Modal Menu 3 chấm */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setMenuVisible(false)}
        >
          <View className="bg-white w-72 rounded-2xl shadow-lg p-3">
            {/* Nếu là hồ sơ của mình → thêm nút chỉnh sửa */}
            {isOwnProfile && (
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("EditProfileScreen");
                }}
                className="py-3"
              >
                <Text className="text-gray-700 text-center border-b border-gray-200">
                  Chỉnh sửa thông tin
                </Text>
              </TouchableOpacity>
            )}

            {/* Luôn có nút sao chép liên kết */}
            <TouchableOpacity onPress={handleCopyLink} className="px-4 py-3">
              <Text className="text-gray-700 text-center">
                Sao chép liên kết
              </Text>
            </TouchableOpacity>

            {/* Nếu không phải hồ sơ của mình → thêm nút báo cáo */}
            {!isOwnProfile && (
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  setReportVisible(true);
                }}
                className="px-4 py-3"
              >
                <Text className="text-red-500 text-center font-medium">
                  Báo cáo vi phạm
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Modal Report (Chỉ cho hồ sơ người khác) */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center px-4"
          onPress={() => setReportVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl"
          >
            <Text className="text-lg font-bold text-center mb-4 text-gray-800">
              Báo cáo vi phạm
            </Text>

            {/* Danh sách lý do */}
            <View className="gap-2">
              {[
                "Hình ảnh không phù hợp",
                "Thông tin sai lệch",
                "Lừa đảo/Gian lận",
                "Quấy rối/Spam",
                "Lý do khác",
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setReportReason(item)}
                  className={`py-3 px-4 rounded-xl border ${
                    reportReason === item
                      ? "bg-red-50 border-red-500"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`${
                        reportReason === item
                          ? "text-red-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {item}
                    </Text>
                    {reportReason === item && (
                      <MaterialIcons name="check" size={18} color="#ef4444" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ô nhập mô tả thêm */}
            {reportReason && (
              <View className="mt-4 animate-pulse">
                <View className="flex-row justify-between mb-1 ml-1">
                  <Text className="text-xs text-gray-600 font-medium">
                    {reportReason === "Lý do khác"
                      ? "Chi tiết vi phạm (Bắt buộc):"
                      : "Chi tiết thêm (Tùy chọn):"}
                  </Text>
                  {/* 🟢 Thêm bộ đếm ký tự ở đây */}
                  <Text
                    className={`text-xs ${reportDescription.length > 200 ? "text-red-500" : "text-gray-400"}`}
                  >
                    {reportDescription.length}/200
                  </Text>
                </View>

                <TextInput
                  className={`bg-gray-50 border rounded-xl p-3 h-24 text-sm ${
                    reportReason === "Lý do khác" && !reportDescription.trim()
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                  placeholder={
                    reportReason === "Lý do khác"
                      ? "Vui lòng nhập rõ lý do..."
                      : "Mô tả rõ hơn về vi phạm này..."
                  }
                  multiline
                  textAlignVertical="top"
                  value={reportDescription}
                  onChangeText={setReportDescription}
                  maxLength={200}
                />
              </View>
            )}

            {/* Buttons Action */}
            <View className="mt-5 gap-3">
              <TouchableOpacity
                onPress={handleSendReport}
                disabled={
                  !reportReason ||
                  isSendingReport ||
                  (reportReason === "Lý do khác" && !reportDescription.trim())
                }
                className={`py-3 rounded-xl flex-row justify-center items-center ${
                  !reportReason ||
                  (reportReason === "Lý do khác" && !reportDescription.trim())
                    ? "bg-gray-300"
                    : "bg-red-500"
                }`}
              >
                {isSendingReport ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-center text-white font-bold text-base">
                    Gửi báo cáo
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setReportVisible(false);
                  setReportReason(null);
                  setReportDescription("");
                }}
                className="py-3 rounded-xl bg-gray-100"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Hủy bỏ
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
