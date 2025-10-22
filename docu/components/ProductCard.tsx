import { View, Text, TouchableOpacity, Image } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

type ProductCardProps = {
  image?: string;
  name: string;
  price: string;
  location: string;
  time: string;
  tag: string;
  category?: string;
  subCategory?: {
    id?: number;
    name?: string;
    source_table?: string;
    source_detail?: any;
  };
  imageCount?: number;
  isFavorite: boolean; //  Prop mới: cho biết sản phẩm có được yêu thích không
  onPress: () => void; // Hàm xử lý khi nhấn vào cả card
  onToggleFavorite: () => void; //  Prop mới: hàm xử lý khi nhấn vào trái tim
};

export default function ProductCard({
  image,
  name,
  price,
  location,
  time,
  tag,
  category,
  subCategory,
  imageCount = 0,
  isFavorite = false,
  onPress,
  onToggleFavorite,
}: ProductCardProps) {
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
            onPress={onToggleFavorite} // ✅ Khi nhấn, gọi hàm onToggleFavorite
            className="absolute top-2 right-2 bg-black/40 p-2 rounded-full"
          >
            {isFavorite ? (
              // Nếu isFavorite là true, hiển thị trái tim màu đỏ
              <FontAwesome name="heart" size={16} color="#ef4444" />
            ) : (
              // Nếu là false, hiển thị trái tim rỗng
              <FontAwesome name="heart-o" size={16} color="white" />
            )}
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
          <Text
            className="text-[13px] font-medium text-[#333] leading-[17px] mb-1.5"
            numberOfLines={2}
          >
            {name}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-center mb-1.5">
          <Text>
            {category}
            {subCategory?.name ? ` - ${subCategory.name}` : "dqq"}
          </Text>
        </View>

        <TouchableOpacity onPress={onPress}>
          <Text className="text-[15px] text-red-500 font-bold mb-1.5">
            {price}
          </Text>
        </TouchableOpacity>

        {/* FIX: Location luôn string, truncate nếu dài */}
        <Text
          className="text-[11px] text-[#666]"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {location || "Chưa rõ địa chỉ"}
        </Text>
      </View>
    </View>
  );
}
