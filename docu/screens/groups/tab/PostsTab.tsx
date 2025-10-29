import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { path } from "../../../config";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";

interface PostsTabProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  limit?: number;
}

export default function PostsTab({ limit, navigation }: PostsTabProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = 1;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `${path}/groups/users/${userId}/group-posts${limit ? `?limit=${limit}` : ""}`
        );
        setPosts(res.data);
      } catch (err) {
        console.error("Lỗi tải bài viết:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [limit]);

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
          renderItem={({ item }) => (
            <View className="mb-6 p-3 bg-white rounded-lg shadow">
              {/* Nhóm */}
              <View className="flex-row items-center mb-2">
                <Image
                  source={
                    item.groupImage && item.groupImage !== ""
                      ? { uri: item.groupImage }
                      : require("../../../assets/meo.jpg")
                  }
                  className="w-8 h-8 rounded-full"
                />
                <Text className="text-xl ml-2 font-semibold">
                  {item.groupName}
                </Text>
              </View>

              {/* User + Title */}
              <Text className="text-gray-600 text-xs">
                Đăng bởi {item.authorName}
              </Text>
              <Text className="font-bold text-base mt-1">{item.name}</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductDetail", { product: item })
                }
              >
                {/* Ảnh bài viết */}
                <Image
                  source={{ uri: item.image }}
                  className="w-full aspect-[3/2] mt-2 rounded-xl border border-gray-200 shadow-sm bg-gray-100"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              
            </View>
          )}
        />
      </View>
    </View>
  );
}
