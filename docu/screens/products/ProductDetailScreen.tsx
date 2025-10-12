import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import "../../global.css";
import { useEffect, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { RootStackParamList } from "../../types";
import { FavoritesAPI } from "../../api/favoritesAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};
// Dữ liệu ảo cho sản phẩm
const productData = {
  id: 1,
  name: "Iphone 12 Promax 128 gb",
  price: "7.500.000 đ",
  image: require("../../assets/hoa.png"),
  address: "Tp hồ chí minh",
  postedTime: "1 tuần trước",
  description:
    "iPhone 12 là bước tiến tiếp theo trong trải nghiệm smartphone của Apple.",
  contactPhone: "0392234485",
  details: {
    brand: "Apple",
    model: "iPhone 12 ProMax",
    condition: "Đã sử dụng",
    color: "Xanh dương",
    storage: "128GB",
    origin: "Mỹ",
    version: "Quốc tế",
  },
  shop: {
    name: "hello",
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    sales: "đã bán 1 lần",
    rating: "4.1 ★",
    reviews: "(14 đánh giá)",
  },
};

export default function ProductDetail({ navigation }: Props) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Nguyễn hoài quắc",
      image: require("../../assets/khi.png"),
      time: "2 tháng trước",
      content: "Rẻ nhưng máy zin màn zin thì cửa hàng mua có bán kg",
    },
  ]);

  const handleSend = () => {
    if (comment.trim() !== "") {
      const newComment = {
        id: comments.length + 1,
        name: "Bạn",
        image: require("../../assets/khi.png"),
        time: "Vừa xong",
        content: comment,
      };
      setComments([...comments, newComment]);
      setComment("");
    }
  };

  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);

  // Lấy dữ liệu Yêu thích từ server khi mở màn hình
  useEffect(() => {
    const fetchFavoriteData = async () => {
      setIsLoadingFavorite(true);
      try {
        const [countRes, checkRes] = await Promise.all([
          FavoritesAPI.count(productData.id),
          FavoritesAPI.check(productData.id), // API này giờ sẽ mặc định kiểm tra cho user 1
        ]);
        setFavoriteCount(countRes.data.count);
        setIsFavorited(checkRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu yêu thích:", error);
      } finally {
        setIsLoadingFavorite(false);
      }
    };
    fetchFavoriteData();
  }, [productData.id]);

  const handleToggleFavorite = async () => {
    const originalFavorited = isFavorited;
    const originalCount = favoriteCount;
    setIsFavorited(!originalFavorited);
    setFavoriteCount(originalCount + (!originalFavorited ? 1 : -1));

    try {
      if (originalFavorited) {
        await FavoritesAPI.remove(productData.id);
      } else {
        await FavoritesAPI.add(productData.id);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật Yêu thích:");
      Alert.alert("Lỗi", "Đã có lỗi xảy ra phía server.");
      setIsFavorited(originalFavorited);
      setFavoriteCount(originalCount);
    }
  };

  const [isPhoneVisible, setIsPhoneVisible] = useState(false);

  const handleCall = async () => {
    const phoneNumber = productData.contactPhone;
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thực hiện cuộc gọi trên thiết bị này.");
    }
  };
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />

      <ScrollView className="flex-1">
        {/* Ảnh sản phẩm */}
        <View className="relative">
          <View className="relative">
            <Image
              source={require("../../assets/ip12promax.png")}
              className="w-full h-72"
              resizeMode="cover"
            />
            <Text className="absolute right-5 bottom-0 bg-red-500 px-4 py-2 rounded-full text-white">
              1/4
            </Text>

            <FontAwesome5
              name="arrow-left"
              size={20}
              color="#000"
              className="absolute top-10 left-5"
              onPress={() => navigation.goBack()}
            />

            <FontAwesome5
              name="ellipsis-v"
              size={20}
              color="#000"
              className="absolute top-10 right-5"
            />
            <FontAwesome5
              name="share"
              size={20}
              color="#000"
              className="absolute top-10 right-12"
            />
          </View>
        </View>
        {/* Nút Lưu */}
        <View className="px-4 py-3 pb-12">
          <View className="flex flex-row justify-between">
            <Text className="text-base font-semibold">
              Iphone 12 Promax 128 xanh{"\n"}biên zin đẹp BH dài 6th
            </Text>
            {/* Nút Lưu */}
            <TouchableOpacity
              className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex-row items-center border border-gray-300"
              onPress={() => {
                console.log("Đã lưu bài viết!");
              }}
            >
              <Text className="ml-1 text-xs text-black">Lưu</Text>
            </TouchableOpacity>
          </View>

          {/* Giá và nút Yêu thích */}
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-red-600 text-xl font-bold">
              {productData.price}
            </Text>
            {isLoadingFavorite ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity
                onPress={handleToggleFavorite} // Nhấn vào đây sẽ không còn báo lỗi đăng nhập
                className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full"
              >
                <FontAwesome
                  name={isFavorited ? "heart" : "heart-o"}
                  size={20}
                  color={isFavorited ? "red" : "gray"}
                />
                <Text className="ml-2 text-sm text-gray-600 font-semibold">
                  {favoriteCount}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Địa chỉ */}
          <Text className="text-gray-500 text-sm mt-1">
            Quận bình thạnh, Tp hồ chí minh
          </Text>
          <Text className="text-gray-400 text-xs">1 tuần trước</Text>

          {/* Thông tin shop */}
          <TouchableOpacity onPress={() => navigation.navigate("UserDetail")}>
            <View className="flex-row items-center mt-4">
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                className="w-12 h-12 rounded-full"
              />
              <View className="ml-3 flex-1">
                <Text className="font-semibold">hello</Text>
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
          <View className="mt-6">
            <Text className="text-lg font-bold">Mô tả chi tiết</Text>
            <Text className="text-gray-700 mt-2 leading-6 text-sm">
              iPhone 12 là bước tiến tiếp theo trong trải nghiệm smartphone...
            </Text>
            <View className="px-4">
              <View className="flex-row items-center justify-between bg-gray-100 px-4 py-2 rounded-lg mt-4">
                <Text className="text-sm text-gray-700">
                  SĐT:{" "}
                  <Text className="font-semibold">
                    {isPhoneVisible
                      ? productData.contactPhone
                      : productData.contactPhone.substring(0, 6) + "****"}
                  </Text>
                </Text>

                {isPhoneVisible ? (
                  // Nếu SĐT đã hiện, hiển thị nút "Gọi ngay"
                  <TouchableOpacity onPress={handleCall}>
                    <Text className="text-sm font-semibold text-blue-500">
                      Gọi ngay
                    </Text>
                  </TouchableOpacity>
                ) : (
                  // Nếu SĐT chưa hiện, hiển thị nút "Hiện số"
                  <TouchableOpacity onPress={() => setIsPhoneVisible(true)}>
                    <Text className="text-sm font-semibold text-blue-500">
                      Hiện số
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Thông tin chi tiết */}
          <View className="mt-6">
            <Text className="text-lg font-bold mb-2">Thông tin chi tiết</Text>
            <View className="border border-gray-200 rounded-lg">
              {/* Hãng */}
              <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Hãng</Text>
                <Text className="text-gray-800 text-sm font-medium">Apple</Text>
              </View>
              {/* Dòng máy */}
              <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Dòng máy</Text>
                <Text className="text-gray-800 text-sm font-medium">
                  iPhone 12 ProMax
                </Text>
              </View>
              {/* Tình trạng */}
              <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Tình trạng</Text>
                <Text className="text-gray-800 text-sm font-medium">
                  Đã sử dụng (chưa sửa chữa)
                </Text>
              </View>
              {/* Màu sắc */}
              <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Màu sắc</Text>
                <Text className="text-gray-800 text-sm font-medium">
                  Xanh dương
                </Text>
              </View>
              {/* Dung lượng */}
              <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                <Text className="text-gray-600 text-sm">Dung lượng</Text>
                <Text className="text-gray-800 text-sm font-medium">128GB</Text>
              </View>
              {/* Xuất xứ */}
              <View className="flex-row justify-between px-3 py-2">
                <Text className="text-gray-600 text-sm">Xuất xứ</Text>
                <Text className="text-gray-800 text-sm font-medium">Mỹ</Text>
              </View>
              <View className="flex-row justify-between px-3 py-2">
                <Text className="text-gray-600 text-sm">Phiên bản</Text>
                <Text className="text-gray-800 text-sm font-medium">
                  Quốc tế
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between bg-gray-200 px-4 py-2 rounded-full mt-4">
              <Text className="text-sm text-gray-700">
                Bạn có sản phẩm tương tự
              </Text>
              <TouchableOpacity className="bg-black px-4 py-1 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  Đăng bán
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bình luận */}
          <View className="mt-8 mb-6">
            <Text className="text-lg font-bold mb-3">Bình luận</Text>
            {comments.map((c) => (
              <View key={c.id} className="flex-row items-start mb-4">
                <Image source={c.image} className="w-10 h-10 rounded-full" />
                <View className="ml-3 flex-1 bg-gray-100 px-3 py-2 rounded-2xl">
                  <Text className="font-semibold text-sm">{c.name}</Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {c.content}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">{c.time}</Text>
                </View>
              </View>
            ))}

            {/* Ô nhập + nút gửi (cuộn xuống mới thấy) */}
            <View className="flex-row items-center border border-gray-300 rounded-full px-3 py-2 bg-white mt-2">
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Bình luận..."
                className="flex-1 px-2 text-sm"
              />
              <TouchableOpacity
                onPress={handleSend}
                className="ml-2 bg-blue-500 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-semibold text-sm">Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
