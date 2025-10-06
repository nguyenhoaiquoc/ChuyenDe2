import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ProductCardProps = {
  image: any;
  title: string;
  price: string;
  location: string;
  time: string;
  tag: string;
  imageCount?: number;
  isFavorite?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
};

export default function ProductCard({
  image,
  title,
  price,
  location,
  time,
  tag,
  imageCount,
  isFavorite = false,
  onPress,
  onToggleFavorite,
}: ProductCardProps) {
  return (
    <View className="w-[48%] mx-[1%] mb-3 bg-white rounded-lg overflow-hidden shadow-sm" style={{ elevation: 2 }}>
      {/* Ảnh sản phẩm */}
      <TouchableOpacity onPress={onPress}>
        <View className="relative">
          <Image source={image} className="w-full h-[140px] rounded-t-lg" resizeMode="cover" />

          {/* Icon tim */}
          <TouchableOpacity
            className="absolute top-2 right-2 bg-white rounded-full w-[28px] h-[28px] justify-center items-center"
            onPress={onToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={16}
              color={isFavorite ? "red" : "#666"}
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
        {/* Tiêu đề */}
        <TouchableOpacity onPress={onPress}>
          <Text
            className="text-[13px] font-medium text-[#333] leading-[17px] mb-1.5"
            numberOfLines={2}
          >
            {title}
          </Text>
        </TouchableOpacity>

        {/* Tag danh mục */}
        <Text className="text-[11px] text-gray-600 mb-1.5">{tag}</Text>

        {/* Giá */}
        <TouchableOpacity onPress={onPress}>
          <Text className="text-[15px] text-red-500 font-bold mb-1.5">{price}</Text>
        </TouchableOpacity>

        {/* Địa điểm */}
        <Text className="text-[11px] text-[#666]">{location}</Text>
      </View>
    </View>
  );
}
