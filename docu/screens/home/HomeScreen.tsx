import { View, TextInput, TouchableOpacity, Image, ScrollView, Text, StatusBar, FlatList } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import ProductCard from "../../components/ProductCard";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../global.css"
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

const categories = [
  { id: "1", name: "Tài liệu", icon: <Feather name="file-text" size={24} color="#333" /> },
  { id: "2", name: "Đồng phục", icon: <FontAwesome5 name="tshirt" size={24} color="#333" /> },
  { id: "3", name: "Giày dép", icon: <FontAwesome5 name="shoe-prints" size={24} color="#333" /> },
  { id: "4", name: "Đồ điện tử", icon: <MaterialIcons name="devices" size={24} color="#333" /> },
  { id: "5", name: "Thú cưng", icon: <FontAwesome5 name="dog" size={24} color="#333" /> },
  { id: "6", name: "Tài liệu khoa", icon: <Feather name="book-open" size={24} color="#333" /> },
];

const filters = [
  { id: "1", label: "Dành cho bạn" },
  { id: "2", label: "Đang tìm mua " },
  { id: "3", label: "Mới nhất " },
  { id: "4", label: "Đồ miễn phí " },
  { id: "5", label: "Trao đổi " },
  { id: "6", label: "Gợi ý cho bạn " },
];

interface Product {
  id: string;
  image: any;
  title: string;
  price: string;
  location: string;
  time: string;
  tag: string;
  imageCount: number;
  isFavorite: boolean;
}

export default function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
     console.log("HomeScreen mounted, gọi API...");
    axios.get("http://192.168.1.92:3000/products")
      .then((res) => {
        console.log("Dữ liệu từ backend:", res.data);
        const rawData = Array.isArray(res.data) ? res.data : [res.data];

        const mapped = rawData.map((item) => ({
          id: item.id.toString(),
          image: require("../../assets/hoa.png"), // ảnh mặc định
          title: item.title,
          price: item.price + " đ",
          location: "TP Hồ Chí Minh", // giả định
          time: "1 ngày trước", // giả định
          tag: "Đồ cũ", // giả định
          imageCount: 1,
          isFavorite: false,
        }));
        console.log("Dữ liệu sau khi map:", mapped);
        setProducts(mapped);
      })
      .catch((err) => {
        if (err.response) {
          console.log("Lỗi từ server:", err.response.data);
        } else if (err.request) {
          console.log("Không nhận được phản hồi từ server:", err.request);
        } else {
          console.log("Lỗi khi gọi API:", err.message);
        }
      });

  }, []);

  return (
    <View className="flex-1 bg-[#f5f6fa]">
      <StatusBar className="auto" />

      {/* Header */}
      <View className="flex-row items-center px-3 py-2 bg-white shadow z-10">
        {/* Icon menu */}
        <TouchableOpacity className="p-2">
          <Feather name="menu" size={24} color="#333" />
        </TouchableOpacity>

        {/* Thanh tìm kiếm */}
        <View className="flex-1 mx-2">
          <TextInput
            placeholder="Tìm kiếm sản phẩm..."
            className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700"
          />
        </View>

        {/* Icon trái tim */}
        <TouchableOpacity className="p-2">
          <FontAwesome name="heart-o" size={22} color="#333" />
        </TouchableOpacity>

        {/* Icon chuông */}
        <TouchableOpacity className="p-2">
          <Feather name="bell" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Banner */}
        <View className="bg-white">
          <View className="flex-row items-center px-4 py-4">
            {/* Text bên trái */}
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-gray-800">
                Mua bán & Trao đổi đồ cũ TDC
              </Text>
            </View>

            {/* Hình bên phải */}
            <Image
              source={require("../../assets/banner.png")}
              className="w-40 h-40 rounded-lg"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Tiêu đề danh mục */}
        <View className="flex-row justify-between items-center px-4 mt-6 mb-2">
          <Text className="text-base font-semibold text-gray-800">Khám phá danh mục</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AllCategories")}>
            <Text className="text-sm text-blue-500 font-medium">Tất cả danh mục</Text>
          </TouchableOpacity>
        </View>

        {/* Danh mục vuốt ngang */}

        {/* Một mục danh mục */}
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="w-20 items-center mr-4 bg-white rounded-lg p-2 shadow-sm"
              onPress={() => {
                console.log('tap category', item.id, item.name);
                navigation.navigate('CategoryIndex', { categoryId: item.id, categoryName: item.name });
              }}
            >
              <View className="mb-2">{item.icon}</View>
              <Text className="text-[12px] text-gray-800 text-center leading-tight">
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

        <View className="px-4">
          <FlatList
            data={filters}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-4 py-2 mr-3 bg-white rounded-full border border-gray-300"
                onPress={() => console.log("Chọn bộ lọc:", item.label)}
              >
                <Text className="text-sm text-gray-700">{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        {/* Danh sách sản phẩm */}
        <View className="px-4 mt-4">
          <FlatList
            data={products}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingBottom: 80 }}
            scrollEnabled={false} // vì đã có ScrollView bên ngoài
            renderItem={({ item }) => {
              console.log("Render sản phẩm:", item); // 👈 log từng sản phẩm khi render
              return (

                <ProductCard
                  image={item.image}
                  title={item.title}
                  price={item.price}
                  location={item.location}
                  time={item.time}
                  tag={item.tag}
                  imageCount={item.imageCount}
                  isFavorite={item.isFavorite}
                  onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  onToggleFavorite={() => console.log("Yêu thích:", item.title)}

                />
              )
            }}
          />
        </View>

      </ScrollView>

      {/* Menu dưới */}
      <Menu />
    </View>
  );
}
