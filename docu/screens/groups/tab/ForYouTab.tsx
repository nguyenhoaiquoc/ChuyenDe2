import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import ProductCard from "../../../components/ProductCard";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";
import axios from "axios";

// Dữ liệu tạm thời
// const groups = [
//   {
//     id: 1,
//     name: "Hội những người yêu chó",
//     members: "72.203 thành viên",
//     posts: "12 bài viết mới hôm nay",
//     image: require("../../../assets/khi.png"),
//   },
//   {
//     id: 2,
//     name: "Hội những người nuôi mèo",
//     members: "58.441 thành viên",
//     posts: "8 bài viết mới hôm nay",
//     image: require("../../../assets/khi.png"),
//   },
//   {
//     id: 3,
//     name: "Hội thú cưng dễ thương",
//     members: "40.310 thành viên",
//     posts: "5 bài viết mới hôm nay",
//     image: require("../../../assets/khi.png"),
//   },
//   {
//     id: 4,
//     name: "Hội chim cảnh",
//     members: "21.332 thành viên",
//     posts: "4 bài viết mới hôm nay",
//     image: require("../../../assets/khi.png"),
//   },
//   {
//     id: 5,
//     name: "Cộng đồng yêu động vật Việt Nam",
//     members: "18.202 thành viên",
//     posts: "9 bài viết mới hôm nay",
//     image: require("../../../assets/khi.png"),
//   },
// ];

// const products = [
//   {
//     id: "1",
//     image: require("../../../assets/hoa.png"),
//     name: "Sản phẩm A",
//     price: "150.000 đ",
//     location: "TP Hồ Chí Minh",
//     time: "2 ngày trước",
//     tag: "Đồ dùng",
//     imageCount: 3,
//     isFavorite: false,
//   },
//   {
//     id: "2",
//     image: require("../../../assets/hoa.png"),
//     name: "Sản phẩm B",
//     price: "250.000 đ",
//     location: "Thủ Đức",
//     time: "1 ngày trước",
//     tag: "Thời trang",
//     imageCount: 2,
//     isFavorite: false,
//   },
//   {
//     id: "3",
//     image: require("../../../assets/hoa.png"),
//     name: "Sản phẩm C",
//     price: "99.000 đ",
//     location: "Quận 1",
//     time: "3 ngày trước",
//     tag: "Đồ dùng",
//     imageCount: 1,
//     isFavorite: true,
//   },
//   {
//     id: "4",
//     image: require("../../../assets/hoa.png"),
//     name: "Sản phẩm D",
//     price: "120.000 đ",
//     location: "Quận 3",
//     time: "4 ngày trước",
//     tag: "Đồ gia dụng",
//     imageCount: 2,
//     isFavorite: true,
//   },
// ];

type ForYouTabProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onViewAllPress: () => void; // Prop này là một hàm
};

export default function ForYouTab({
  navigation,
  onViewAllPress,
}: ForYouTabProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchLatestGroups = async () => {
      try {
        const res = await axios.get(`${path}/groups/latest`);
        setGroups(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy nhóm mới nhất:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestGroups();
  }, []);

  const [posts, setPosts] = useState<any[]>([]);
  const userId = 1;

  useEffect(() => {
    axios
      .get(`${path}/groups/users/${userId}/group-posts`) // không limit
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("❌ Lỗi khi lấy bài viết:", err));
  }, []);

  return (
    <ScrollView className="flex-1 px-4">
      {/* Phần Nhóm của bạn */}
      <View>
        <View className="flex-row justify-between items-center mb-2 mt-3">
          <Text className="text-base font-semibold">Nhóm của bạn</Text>
          <TouchableOpacity onPress={onViewAllPress}>
            <Text className="text-blue-500 text-sm font-medium">
              Xem tất cả
            </Text>
          </TouchableOpacity>
        </View>

        <View>
          {groups.map((g) => (
            <View key={g.id} className="flex-row items-center mb-3">
              <Image
                source={
                  g.image
                    ? { uri: g.image }
                    : require("../../../assets/khi.png")
                }
                className="w-12 h-12 rounded-full"
              />
              <View className="ml-3">
                <Text className="font-semibold text-sm">{g.name}</Text>
                <Text className="text-gray-500 text-xs">{g.members}</Text>
                <Text className="text-gray-400 text-xs">{g.posts}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Từ nhóm của bạn */}
      <View className="mb-24">
        <Text className="text-base font-semibold mb-3">Từ nhóm của bạn</Text>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ProductCard
              image={item.thumbnail_url}
              name={item.name}
              price={item.price}
              location={item.location}
              time={item.created_at}
              tag={item.tag}
              imageCount={item.imageCount || 1}
              isFavorite={false}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
