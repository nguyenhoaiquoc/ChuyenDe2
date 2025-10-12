import React from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, PostType } from "../../types";
import { Feather } from "@expo/vector-icons";
import ProductCard from "../../components/ProductCard";

const products = [
  {
    id: "1",
    image: require("../../assets/hoa.png"),
    title: "Sản phẩm A",
    price: "150.000 đ",
    location: "TP Hồ Chí Minh",
    time: "2 ngày trước",
    tag: "Đồ dùng",
    imageCount: 3,
    isFavorite: false,
  },
  {
    id: "2",
    image: require("../../assets/hoa.png"),
    title: "Sản phẩm B",
    price: "250.000 đ",
    location: "Thủ Đức",
    time: "1 ngày trước",
    tag: "Thời trang",
    imageCount: 2,
    isFavorite: false,
  },
  {
    id: "3",
    image: require("../../assets/hoa.png"),
    title: "Sản phẩm C",
    price: "99.000 đ",
    location: "Quận 1",
    time: "3 ngày trước",
    tag: "Đồ dùng",
    imageCount: 1,
    isFavorite: true,
  },
  {
    id: "4",
    image: require("../../assets/hoa.png"),
    title: "Sản phẩm D",
    price: "120.000 đ",
    location: "Quận 3",
    time: "4 ngày trước",
    tag: "Đồ gia dụng",
    imageCount: 2,
    isFavorite: true,
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "GroupDetailScreen">;

export default function GroupDetailScreen({ route, navigation }: Props) {
  // Lấy dữ liệu group đã được truyền qua
  const { group } = route.params;

  // Lọc ra các bài viết thuộc về nhóm này
  //   const groupPosts = posts.filter((post) => post.groupId === group.id);

  //   const renderPost = ({ item }: ListRenderItemInfo<PostType>) => (
  //     <View className="bg-white p-4 rounded-lg mb-3 border border-gray-100">
  //       <View className="flex-row items-center mb-3">
  //         <Image source={item.avatar} className="w-10 h-10 rounded-full" />
  //         <View className="ml-3">
  //           <Text className="font-semibold">{item.author}</Text>
  //           <Text className="text-xs text-gray-500">{item.time}</Text>
  //         </View>
  //       </View>
  //       <Text className="text-base text-gray-800">{item.content}</Text>
  //     </View>
  //   );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header với ảnh bìa */}
      <ImageBackground source={group.image} className="h-48 w-full">
        <View className="flex-1 justify-between p-4 bg-black/40">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/70 p-2 rounded-full w-10 h-10 items-center justify-center"
          >
            <Feather name="arrow-left" size={20} color="#000" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">{group.name}</Text>
            <Text className="text-white text-sm">{group.members}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Danh sách bài viết */}
      <View className="my-10">
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ProductCard
              image={item.image}
              title={item.title}
              price={item.price}
              location={item.location}
              time={item.time}
              tag={item.tag}
              imageCount={item.imageCount}
              isFavorite={item.isFavorite}
              onPress={() =>
                navigation.navigate("ProductDetail", { product: item })
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
