import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import ProductCard from "../../components/ProductCard";
import axios from "axios";
import { path } from "../../config";

// Định nghĩa kiểu params cho navigation
type GroupDetailScreenProps = {
  navigation: any;
  route: { params: { group: any } };
};

// --- Màn hình chi tiết nhóm ---
export default function GroupDetailScreen({
  navigation,
  route,
}: GroupDetailScreenProps) {
  const { group } = route.params;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!group?.id) {
      console.error("Không có Group ID");
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${path}/groups/${group.id}/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm của nhóm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [group?.id]);

  if (!group) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Không tìm thấy thông tin nhóm.</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <ImageBackground
      source={
        group.image ? { uri: group.image } : require("../../assets/khi.png")
      }
      className="h-48 w-full mb-4"
    >
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

  if (loading) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1 }}
        className="bg-gray-100 flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} className="bg-gray-100">
      <FlatList
        data={products}
        keyExtractor={(item: any) => String(item.id)}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
        renderItem={({ item }) => (
          <View style={{ flex: 0.5, margin: 4 }}>
            <ProductCard
              product={item}
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
