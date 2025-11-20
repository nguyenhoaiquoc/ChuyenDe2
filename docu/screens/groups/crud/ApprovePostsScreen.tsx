import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";

type Props = NativeStackScreenProps<RootStackParamList, "ApprovePostsScreen">;

export default function ApprovePostsScreen({ navigation, route }: Props) {
  const { groupId } = route.params;

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchPendingPosts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${path}/groups/${groupId}/pending-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (error: any) {
      console.error("Lỗi tải bài chờ duyệt:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải danh sách bài viết"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingPosts();
  };

  const handleApprove = async (postId: number, approve: boolean) => {
    const action = approve ? "duyệt" : "từ chối";
    Alert.alert(
      `Xác nhận ${action}`,
      `Bạn có chắc chắn muốn ${action} bài viết này?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: approve ? "Duyệt" : "Từ chối",
          style: approve ? "default" : "destructive",
          onPress: async () => {
            setProcessing(postId);
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await axios.post(
                `${path}/groups/posts/${postId}/approve`,
                { approve },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              Alert.alert("Thành công", res.data.message);
              // Xóa bài viết khỏi danh sách
              setPosts((prev) => prev.filter((p) => p.id !== postId));
            } catch (error: any) {
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || `Không thể ${action} bài viết`
              );
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
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
        <Text className="text-lg font-semibold ml-4">Duyệt bài viết</Text>
      </View>

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

          return (
            <View className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
              {/* User info */}
              <View className="flex-row items-center p-3 border-b border-gray-100">
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
                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full ${
                    item?.postType?.name === "Đăng bán"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                >
                  <Text className="text-xs text-white font-semibold">
                    {item?.postType?.name || "Không rõ"}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View className="p-3">
                <Text className="font-bold text-base text-gray-900 mb-2">
                  {item.name}
                </Text>

                {item.description && (
                  <Text
                    className="text-sm text-gray-600 mb-2"
                    numberOfLines={3}
                  >
                    {item.description}
                  </Text>
                )}

                <Text className="text-red-500 font-semibold text-lg mb-2">
                  {priceFormat}
                </Text>

                {item.location && (
                  <View className="flex-row items-center mb-2">
                    <Feather name="map-pin" size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {item.location}
                    </Text>
                  </View>
                )}

                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-full aspect-[4/3] rounded-lg bg-gray-100"
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* Action buttons */}
              <View className="flex-row border-t border-gray-100">
                <TouchableOpacity
                  onPress={() => handleApprove(item.id, false)}
                  disabled={processing === item.id}
                  className="flex-1 flex-row items-center justify-center py-3 border-r border-gray-100"
                >
                  {processing === item.id ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <>
                      <Feather name="x" size={20} color="#EF4444" />
                      <Text className="ml-2 text-red-500 font-semibold">
                        Từ chối
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleApprove(item.id, true)}
                  disabled={processing === item.id}
                  className="flex-1 flex-row items-center justify-center py-3"
                >
                  {processing === item.id ? (
                    <ActivityIndicator size="small" color="#10B981" />
                  ) : (
                    <>
                      <Feather name="check" size={20} color="#10B981" />
                      <Text className="ml-2 text-green-500 font-semibold">
                        Duyệt
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
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
