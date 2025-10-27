import React, { useEffect, useState } from "react";
import { View, FlatList, ScrollView, ActivityIndicator } from "react-native";
import axios from "axios";
import ProductCard from "../../../components/ProductCard";
import { path } from "../../../config";

export default function PostsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Giả sử user đang login có id = 1
  const userId = 1;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 1. Lấy danh sách sản phẩm từ backend
        const res = await axios.get(`${path}/products`);
        let data = res.data;

        // 2. Với mỗi sản phẩm private, check membership
        const checked = await Promise.all(
          data.map(async (p: any) => {
            if (p.group_id) {
              const check = await axios.get(
                `${path}/groups/${p.group_id}/is-member/${userId}`
              );
              // Nếu không phải member thì ẩn sản phẩm
              if (!check.data.isMember && !p.isPublic) {
                return null;
              }
            }
            return p;
          })
        );

        // 3. Lọc bỏ sản phẩm null
        setProducts(checked.filter(Boolean));
      } catch (err) {
        console.error("❌ Lỗi fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-4">
      <View className="my-10">
        <FlatList
          data={products}
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
