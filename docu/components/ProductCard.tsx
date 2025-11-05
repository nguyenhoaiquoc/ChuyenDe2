import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PostType, Product } from "../types";
import React from "react";

type ProductCardProps = {
  product: Product;
  isFavorite?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onPressPostType?: (postType: PostType) => void;
};

export default function ProductCard({
  product,
  isFavorite,
  onPress,
  onToggleFavorite,
  onPressPostType,
}: ProductCardProps) {
  const placeholder = "https://cdn-icons-png.flaticon.com/512/8146/8146003.png";
  const image = product.image || product.thumbnail_url || placeholder;
  const name = product.name;
  const price = product.price;
  const location =
    product.location || product.address_json?.full || "Chưa rõ địa chỉ";
  const time = product.time || "vừa xong";
  const tag =
    product.tag ||
    (typeof product.category === "object" && product.category !== null
      ? product.category.name
      : (product.category ?? "Chưa rõ danh mục"));
  const postType = product.postType;
  const authorName = product.authorName;
  const category =
    typeof product.category === "object"
      ? product.category.name
      : product.category;
  const subCategory = product.sub_category_change;
  const imageCount = product.images?.length || 1;
  const isFavorites = isFavorite ?? product.isFavorite ?? false;
  return (
    <View
      className="w-[48%] mx-[1%] mb-3 bg-white rounded-lg overflow-hidden shadow-sm"
      style={{ elevation: 2 }}
    >
      {/* Ảnh sản phẩm */}
      <TouchableOpacity onPress={onPress}>
        <View className="relative w-full h-[140px] bg-gray-200 justify-center items-center">
          <Image
            source={
              image && typeof image === "string"
                ? { uri: image }
                : { uri: placeholder }
            }
            className="w-full h-full rounded-t-lg"
            resizeMode="contain"
          />

          {/* Icon tim */}
          <TouchableOpacity
            className="absolute top-2 right-2 bg-white rounded-full w-[28px] h-[28px] justify-center items-center"
            onPress={onToggleFavorite}
          >
            <Ionicons
              name={isFavorites ? "heart" : "heart-outline"}
              size={16}
              color={isFavorites ? "#ff0000ff" : "#777"}
            />
          </TouchableOpacity>

          {/* Overlay thời gian + số ảnh */}
          <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded">
            <Text className="text-[10px] text-white">
              {time} • {imageCount} ảnh
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Nội dung */}
      <View className="p-3">
        <TouchableOpacity onPress={onPress}>
          {/* Tên sản phẩm */}
          <Text
            className="text-[13px] font-medium text-[#333] leading-[17px] mb-1.5"
            numberOfLines={2}
          >
            {name}
          </Text>
        </TouchableOpacity>
        {/* Post type as button */}
        {postType?.name && onPressPostType && (
          <TouchableOpacity
            className="mb-1.5 px-2 py-1 bg-green-500 rounded-full self-start"
            onPress={() => onPressPostType(postType)}
          >
            <Text className="text-[10px] text-white font-semibold">
              {postType.name}
            </Text>
          </TouchableOpacity>
        )}
        {/* Danh mục */}
        <View className="flex-row justify-between items-center mb-1.5">
          <Text>{category}</Text>
        </View>
        {/* Giá */}
        <TouchableOpacity onPress={onPress}>
          <Text className="text-[15px] text-red-500 font-bold mb-1.5">
            {price}
          </Text>
        </TouchableOpacity>
        {/* Địa chỉ */}
        <Text
          className="text-[11px] text-[#666]"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {location || "Chưa rõ địa chỉ"}
        </Text>
        {/* Tên người dùng */}
        <Text
          className="text-[11px] text-blue-600 font-semibold mb-0.5"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {authorName || "Ẩn danh"}
        </Text>
      </View>
    </View>
  );
}
