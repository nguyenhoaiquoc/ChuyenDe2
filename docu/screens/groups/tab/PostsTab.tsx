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

interface PostsTabProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  limit?: number;
}

export default function PostsTab({ limit, navigation }: PostsTabProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để xem nhóm đã tham gia.");
      return;
    }

    try {
      const res = await axios.get(
        `${path}/groups/my/group-posts?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPosts(res.data);
    } catch (err) {
      console.log("Lỗi tải bài viết:", err);
    } finally {
      setLoading(false);
      setRefreshing(false); // 👈 nhớ reset refreshing
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [limit]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View className="flex-1 mb-10 px-4 pt-2 pb-4">
      <View className="my-4">
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View className="mb-6 p-3 bg-white rounded-lg shadow">
              {/* Nhóm */}
              <View className="flex-row items-center ">
                <Image
                  source={
                    item.group?.image
                      ? { uri: item.group.image }
                      : require("../../../assets/meo.jpg")
                  }
                  className="w-12 h-12 rounded-full"
                />
                <Text className="text-xl ml-2 font-semibold">
                  {item.group.name || "Nhóm ẩn danh"}
                </Text>
              </View>

              {/* User */}
              <View className="flex-row items-center ml-7">
                <Image
                  source={
                    item.user?.avatar
                      ? { uri: item.user.avatar }
                      : require("../../../assets/meo.jpg")
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
            </View>
          )}
        />
      </View>
    </View>
  );
}
