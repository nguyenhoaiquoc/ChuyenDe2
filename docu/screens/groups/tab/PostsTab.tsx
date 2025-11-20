import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { path } from "../../../config";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

interface PostsTabProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function PostsTab({ navigation }: PostsTabProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để xem nhóm đã tham gia.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const res = await axios.get(`${path}/groups/my/group-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Gán isFavorite và favoriteCount nếu chưa có
      const mapped = res.data.map((p: any) => ({
        ...p,
        isFavorite: p.isFavorite ?? false,
        favoriteCount: p.favoriteCount ?? 0,
      }));

      setPosts(mapped);
    } catch (err) {
      console.log("❌ Lỗi tải bài viết:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts(); // chỉ chạy 1 lần khi mount
  }, []);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  // Toggle favorite realtime
  const handleToggleFavorite = async (postId: number) => {
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return;

    const post = posts[index];

    // Cập nhật UI ngay lập tức
    const updatedPosts = [...posts];
    updatedPosts[index] = {
      ...post,
      isFavorite: !post.isFavorite,
      favoriteCount: post.favoriteCount + (post.isFavorite ? -1 : 1),
    };
    setPosts(updatedPosts);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập");

      await axios.post(
        `${path}/favorites/toggle/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // Rollback nếu lỗi
      const rollbackPosts = [...posts];
      rollbackPosts[index] = post;
      setPosts(rollbackPosts);
      console.log("❌ Lỗi toggle yêu thích:", err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View className="flex-1 mb-10 px-4 pt-2 pb-4">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View className="mb-6 p-3 bg-white rounded-lg shadow">
            {/* Nhóm */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("GroupDetailScreen", {
                  groupId: item.group.id,
                })
              }
            >
              <View className="flex-row items-center">
                <Image
                  source={
                    item.group?.image
                      ? { uri: item.group.image }
                      : require("../../../assets/defaultgroup.png")
                  }
                  className="w-12 h-12 rounded-full"
                />
                <Text className="text-xl ml-2 font-semibold">
                  {item.group.name || "Nhóm ẩn danh"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* User */}
            <View className="flex-row items-center ml-7 mt-1">
              <Image
                source={
                  item.user?.avatar
                    ? { uri: item.user.avatar }
                    : require("../../../assets/khi.png")
                }
                className="w-7 h-5 rounded-full"
              />
              <Text className="text-gray-600 text-xs ml-2">
                Đăng bởi {item.user?.name || "Ẩn danh"}
              </Text>
            </View>

            <Text className="font-bold text-base mt-3">{item.name}</Text>

            {/* Giá */}
            <Text className="text-red-500 text-sm mt-1">
              {item.price === 0
                ? "Miễn phí"
                : item.price == null
                  ? "Trao đổi"
                  : item.price}
            </Text>

            {/* Ảnh bài viết */}
            {item.thumbnail_url && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductDetail", { product: item })
                }
              >
                <Image
                  source={{ uri: item.thumbnail_url }}
                  className="w-full aspect-[3/2] mt-2 rounded-xl border border-gray-200 shadow-sm bg-gray-100"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}

            {/* Nút tym + số lượng tym */}
            <View className="flex-row items-center mt-2">
              <TouchableOpacity
                onPress={() => handleToggleFavorite(item.id)}
                className="flex-row items-center"
              >
                <Ionicons
                  name={item.isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={item.isFavorite ? "red" : "gray"}
                />
                <Text className="ml-1 text-gray-700">{item.favoriteCount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
