import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";

type Props = NativeStackScreenProps<RootStackParamList, "MyGroupPostsScreen">;

export default function MyGroupPostsScreen({ navigation, route }: Props) {
  const { groupId } = route.params;

  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyPosts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${path}/groups/${groupId}/my-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats({
        total: res.data.total,
        approved: res.data.approved,
        pending: res.data.pending,
      });
      setPosts(res.data.posts || []);
    } catch (error: any) {
      console.error("Lỗi tải bài viết:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyPosts();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4">Bài viết của bạn</Text>
      </View>

      {/* Stats */}
      <View className="flex-row bg-white border-b border-gray-200 p-4">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-gray-900">
            {stats.total}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Tổng số</Text>
        </View>
        <View className="flex-1 items-center border-l border-gray-200">
          <Text className="text-2xl font-bold text-green-600">
            {stats.approved}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Đã duyệt</Text>
        </View>
        <View className="flex-1 items-center border-l border-gray-200">
          <Text className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Chờ duyệt</Text>
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        renderItem={({ item }) => {
          const imageUrl =
            item.thumbnail_url ||
            (item.images?.length > 0 ? item.images[0].image_url : null);

          const priceFormat =
            item.price === 0
              ? "Miễn phí"
              : item.price == null
                ? "Trao đổi"
                : `${item.price.toLocaleString()} đ`;

          const isPending = item.productStatus?.id === 1;

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProductDetail", { product: item })
              }
              className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Status Badge */}
              <View
                className={`absolute top-2 right-2 z-10 px-3 py-1 rounded-full ${
                  isPending ? "bg-yellow-500" : "bg-green-500"
                }`}
              >
                <Text className="text-xs font-semibold text-white">
                  {isPending ? "Chờ duyệt" : "Đã duyệt"}
                </Text>
              </View>

              <View className="flex-row">
                {/* Image */}
                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-28 h-28 bg-gray-100"
                    resizeMode="cover"
                  />
                )}

                {/* Content */}
                <View className="flex-1 p-3">
                  <Text
                    className="font-bold text-base text-gray-900 mb-1"
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text className="text-red-500 font-semibold mb-2">
                    {priceFormat}
                  </Text>

                  {item.location && (
                    <View className="flex-row items-center mb-1">
                      <Feather name="map-pin" size={12} color="#6b7280" />
                      <Text
                        className="text-xs text-gray-500 ml-1"
                        numberOfLines={1}
                      >
                        {item.location}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center">
                    <Feather name="clock" size={12} color="#6b7280" />
                    <Text className="text-xs text-gray-500 ml-1">
                      {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Feather name="file-text" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              Bạn chưa có bài viết nào trong nhóm này
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
