import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";

type ApprovePostsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ApprovePostsScreen"
>;

export default function ApprovePostsScreen({
  navigation,
  route,
}: ApprovePostsScreenProps) {
  const { groupId } = route.params;

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${path}/groups/${groupId}/pending-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (error: any) {
      console.error("Lỗi tải bài chờ duyệt:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: number, approve: boolean) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${path}/groups/posts/${postId}/approve`,
        { approve },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        "Thành công",
        approve ? "Đã duyệt bài viết" : "Đã từ chối bài viết"
      );
      fetchPendingPosts();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xử lý bài viết");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-3">
          Duyệt bài viết ({posts.length})
        </Text>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-white mb-4 rounded-lg p-4">
            {/* Author Info */}
            <View className="flex-row items-center mb-3">
              <Image
                source={
                  item.user?.avatar
                    ? { uri: item.user.avatar }
                    : require("../../../assets/khi.png")
                }
                className="w-10 h-10 rounded-full"
              />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-gray-900">
                  {item.user?.name || "Người dùng"}
                </Text>
                <Text className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString("vi-VN")}
                </Text>
              </View>
            </View>

            {/* Post Content */}
            <Text className="font-bold text-base mb-2">{item.name}</Text>
            <Text className="text-gray-600 text-sm mb-3" numberOfLines={3}>
              {item.description}
            </Text>

            {/* Image */}
            {item.thumbnail_url && (
              <Image
                source={{ uri: item.thumbnail_url }}
                className="w-full h-48 rounded-lg mb-3"
                resizeMode="cover"
              />
            )}

            {/* Price & Location */}
            <View className="flex-row justify-between mb-3">
              <Text className="text-red-500 font-semibold">
                {item.price === 0
                  ? "Miễn phí"
                  : item.price
                    ? `${item.price.toLocaleString()} đ`
                    : "Trao đổi"}
              </Text>
              {item.location && (
                <View className="flex-row items-center">
                  <Feather name="map-pin" size={12} color="#6b7280" />
                  <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => handleApprove(item.id, true)}
                className="flex-1 bg-green-600 py-2.5 rounded-lg flex-row items-center justify-center"
              >
                <Feather name="check" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Duyệt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleApprove(item.id, false)}
                className="flex-1 bg-red-600 py-2.5 rounded-lg flex-row items-center justify-center"
              >
                <Feather name="x" size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-10">
            <Feather name="check-circle" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              Không có bài viết nào chờ duyệt
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}