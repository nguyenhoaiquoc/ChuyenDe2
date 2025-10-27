import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ProductCardProps = {
  image?: string;
  name: string;
  price: string;
  location: string;
  time: string;
  tag: string | React.ReactNode; // cho phép truyền cả text hoặc element
  postType?: {
    id?: string | number;
    name?: string;
  };
  onPressPostType?: (postType: { id?: string | number; name?: string }) => void;
  authorName?: string;
  category?: string;
  subCategory?: {
    id?: number;
    name?: string;
    source_table?: string;
    source_detail?: any;
  };
  imageCount?: number;
  isFavorite?: boolean;
  onPressCategory?: () => void;
  onPress?: () => void;
  onToggleFavorite?: () => void;
};

export default function ProductCard({
  image,
  name,
  price,
  postType,
  location,
  time,
  authorName,
  category,
  subCategory,
  imageCount = 0,
  isFavorite = false,
  onPressCategory,
  onPress,
  onToggleFavorite,
  onPressPostType,
}: ProductCardProps) {
  // console.log("🖼️ Image prop nhận vào:", image);
  const placeholder = "https://cdn-icons-png.flaticon.com/512/8146/8146003.png"; // fallback ảnh

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
