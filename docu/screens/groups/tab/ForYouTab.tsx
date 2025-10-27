import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import ProductCard from "../../../components/ProductCard";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";
import axios from "axios";

type ForYouTabProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onViewAllPress: () => void;
};

export default function ForYouTab({
  navigation,
  onViewAllPress,
}: ForYouTabProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, postRes] = await Promise.all([
          axios.get(`${path}/groups/latest`), // 5 nhóm mới nhất
          axios.get(`${path}/groups/users/${userId}/group-posts?limit=4`), // 4 bài viết mới nhất
        ]);
        setGroups(groupRes.data);
        setPosts(postRes.data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-4">
      {/* Nhóm mới nhất */}
      <View>
        <View className="flex-row justify-between items-center mb-2 mt-3">
          <Text className="text-base font-semibold">Nhóm mới nhất</Text>
          <TouchableOpacity onPress={onViewAllPress}>
            <Text className="text-blue-500 text-sm font-medium">
              Xem tất cả
            </Text>
          </TouchableOpacity>
        </View>

        {groups.map((g) => (
          <View key={g.id} className="flex-row items-center mb-3">
            <Image
              source={
                g.image ? { uri: g.image } : require("../../../assets/khi.png")
              }
              className="w-12 h-12 rounded-full"
            />
            <View className="ml-3">
              <Text className="font-semibold text-sm">{g.name}</Text>
              <Text className="text-gray-500 text-xs">{g.members}</Text>
              <Text className="text-gray-400 text-xs">{g.posts}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bài viết mới nhất từ nhóm */}
      <View className="mb-24">
        <Text className="text-base font-semibold mb-3">Từ nhóm của bạn</Text>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 16,
          }}
          scrollEnabled={false}
          renderItem={({ item }) => {
            return (
              <View className="w-[48%] bg-white rounded-lg shadow p-2">
                {/* Ảnh bài viết */}

                <Image
                  source={
                    item.image
                      ? { uri: item.image }
                      : require("../../../assets/khi.png")
                  }
                  className="w-full h-40 rounded-lg"
                  resizeMode="cover"
                />

                {/* Tiêu đề */}
                <Text className="font-semibold text-sm mt-2" numberOfLines={1}>
                  {item.name}
                </Text>

                {/* Giá + vị trí */}
                <Text className="text-gray-500 text-xs">
                  {item.price
                    ? `${item.price.toLocaleString()} đ`
                    : "Thỏa thuận"}
                </Text>
                <Text className="text-gray-400 text-xs">{item.location}</Text>
              </View>
            );
          }}
        />
      </View>
    </ScrollView>
  );
}
