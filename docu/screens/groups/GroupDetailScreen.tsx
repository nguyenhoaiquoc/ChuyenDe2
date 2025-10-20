import React from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import ProductCard from "../../components/ProductCard";

// --- Dữ liệu nhóm mẫu ---
const groupData = [
  {
    id: "1",
    name: "Hội những người yêu chó",
    members: "72.203 thành viên",
    posts: "12 bài viết mới hôm nay",
    image: require("../../assets/khi.png"),
  },
  {
    id: "2",
    name: "Hội những người nuôi mèo",
    members: "58.441 thành viên",
    posts: "8 bài viết mới hôm nay",
    image: require("../../assets/khi.png"),
  },
  {
    id: "3",
    name: "Hội những người thích chim cảnh",
    members: "31.002 thành viên",
    posts: "5 bài viết mới hôm nay",
    image: require("../../assets/khi.png"),
  },
];

// --- Dữ liệu sản phẩm mẫu ---
const allProducts = [
  {
    id: "1",
    groupId: "1",
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
    groupId: "2",
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
    groupId: "1",
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
    groupId: "3",
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

// --- Màn hình chi tiết nhóm ---
export default function GroupDetailScreen({ navigation }: any) {
  // 🧪 Chọn nhóm cần hiển thị (ví dụ: nhóm có id = "1")
  const selectedGroupId = "1";
  const group = groupData.find((g) => g.id === selectedGroupId);

  if (!group) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Không tìm thấy nhóm.</Text>
      </View>
    );
  }

  const groupProducts = allProducts.filter(
    (product) => product.groupId === group.id
  );

  const renderHeader = () => (
    <ImageBackground source={group.image} className="h-48 w-full mb-4">
      <View className="flex-1 justify-between p-4 bg-black/40">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-white/70 p-2 rounded-full w-10 h-10 items-center justify-center mt-2"
        >
          <Feather name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-2xl font-bold">{group.name}</Text>
          <Text className="text-white text-sm">{group.members}</Text>
        </View>
      </View>
    </ImageBackground>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} className="bg-gray-100">
      <FlatList
        data={groupProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
        renderItem={({ item }) => (
          <View style={{ flex: 0.5, margin: 4 }}>
            <ProductCard
              image={item.image}
              name={item.title}
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
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-10">
            <Text className="text-gray-500">
              Chưa có sản phẩm nào trong nhóm này.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
