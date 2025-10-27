import React from "react";
import { View, FlatList, ScrollView } from "react-native";
import ProductCard from "../../../components/ProductCard";

const products = [
  {
    id: "1",
    image: require("../../../assets/hoa.png"),
    name: "Sản phẩm A",
    price: "150.000 đ",
    location: "TP Hồ Chí Minh",
    time: "2 ngày trước",
    tag: "Đồ dùng",
    imageCount: 3,
    isFavorite: false,
  },
  {
    id: "2",
    image: require("../../../assets/hoa.png"),
    name: "Sản phẩm B",
    price: "250.000 đ",
    location: "Thủ Đức",
    time: "1 ngày trước",
    tag: "Thời trang",
    imageCount: 2,
    isFavorite: false,
  },
  {
    id: "3",
    image: require("../../../assets/hoa.png"),
    name: "Sản phẩm C",
    price: "99.000 đ",
    location: "Quận 1",
    time: "3 ngày trước",
    tag: "Đồ dùng",
    imageCount: 1,
    isFavorite: true,
  },
  {
    id: "4",
    image: require("../../../assets/hoa.png"),
    name: "Sản phẩm D",
    price: "120.000 đ",
    location: "Quận 3",
    time: "4 ngày trước",
    tag: "Đồ gia dụng",
    imageCount: 2,
    isFavorite: true,
  },
];

export default function PostsTab() {
  return (
    <ScrollView className="flex-1 px-4">
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
              name={item.name}
              price={item.price}
              location={item.location}
              time={item.time}
              tag={item.tag}
              imageCount={item.imageCount}
              isFavorite={item.isFavorite}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}
