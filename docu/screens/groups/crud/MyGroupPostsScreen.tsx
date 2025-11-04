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

type MyGroupPostsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "MyGroupPostsScreen"
>;

export default function MyGroupPostsScreen({
  navigation,
  route,
}: MyGroupPostsScreenProps) {
  const { groupId } = route.params;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${path}/groups/${groupId}/my-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error: any) {
      console.error("Lỗi tải bài viết:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
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
          Quản lý nội dung của bạn
        </Text>
      </View>

      {/* Stats */}
      <View className="bg-white mx-4 mt-4 p-4 rounded-lg">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">
              {stats?.total || 0}
            </Text>
            <Text className="text-gray-600 text-sm">Tổng bài viết</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">
              {stats?.approved || 0}
            </Text>
            <Text className="text-gray-600 text-sm">Đã duyệt</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-600">
              {stats?.pending || 0}
            </Text>
            <Text className="text-gray-600 text-sm">Chờ duyệt</Text>
          </View>
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={stats?.posts || []}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const location = item.location || "Không rõ địa điểm";
          const createdAt = item.created_at
            ? new Date(item.created_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProductDetail", { product: item })
              }
              className="bg-white mb-3 rounded-lg p-3"
            >
              <View className="flex-row">
                <Image
                  source={{
                    uri: item.thumbnail_url || item.images?.[0]?.image_url,
                  }}
                  className="w-20 h-20 rounded-lg"
                />
                <View className="flex-1 ml-3">
                  {/* Tên + trạng thái */}
                  <View className="flex-row justify-between items-center">
                    <Text className="font-semibold text-gray-900">
                      {item.name}
                    </Text>
                    <View className="flex-row items-center">
                      {item.productStatus?.id === 2 ? (
                        <>
                          <Feather
                            name="check-circle"
                            size={14}
                            color="green"
                          />
                          <Text className="text-xs text-green-600 ml-1">
                            Đã duyệt
                          </Text>
                        </>
                      ) : (
                        <>
                          <Feather name="clock" size={14} color="orange" />
                          <Text className="text-xs text-orange-600 ml-1">
                            Chờ duyệt
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <Text className="text-sm text-gray-500 mt-1">
                    {item.price === 0
                      ? "Miễn phí"
                      : item.price
                        ? `${item.price.toLocaleString()} đ`
                        : "Trao đổi"}
                  </Text>

                  {/* Thời gian */}
                  {createdAt ? (
                    <Text className="text-xs text-gray-400 mt-1">
                      {createdAt}
                    </Text>
                  ) : null}

                  {/* Vị trí */}
                  {location ? (
                    <Text className="text-xs text-gray-500 mt-1">
                      <Feather name="map-pin" size={12} color="#6b7280" />{" "}
                      {location}
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
