// screens/FeedbackScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RatingData, RootStackParamList } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function FeedbackScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyRatings = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${path}/users/my-ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRatings(res.data);
    } catch (err: any) {
      Alert.alert("Lỗi", "Không thể tải đánh giá của bạn");
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyRatings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyRatings(true);
  }, []);

  const handleDeleteRating = (ratingId: number, userId: number) => {
    Alert.alert("Xóa đánh giá", "Bạn có chắc muốn xóa đánh giá này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(`${path}/users/${userId}/rate`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Thành công", "Đã xóa đánh giá");
            fetchMyRatings(); // reload lại danh sách
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xóa đánh giá");
          }
        },
      },
    ]);
  };

  const renderRating = ({ item }: { item: RatingData }) => {
    const timeAgo = (dateString: string) => {
      const now = new Date();
      const date = new Date(dateString);
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return "Hôm nay";
      if (days < 7) return `${days} ngày trước`;
      if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
      return `${Math.floor(days / 30)} tháng trước`;
    };

    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Image
              source={
                item.ratedUser?.image
                  ? {
                      uri: item.ratedUser.image.startsWith("http")
                        ? item.ratedUser.image
                        : `${path}${item.ratedUser.image}`,
                    }
                  : require("../../assets/default.png")
              }
              className="w-12 h-12 rounded-full mr-3"
            />
            <View>
              <Text className="font-semibold text-base">
                {item.ratedUser?.fullName}
              </Text>
              <Text className="text-xs text-gray-500">
                {timeAgo(item.createdAt)}
              </Text>
            </View>
          </View>

          {/* Nút 3 chấm để xóa */}
          <TouchableOpacity
            onPress={() =>
              item.ratedUser?.id &&
              handleDeleteRating(item.id, item.ratedUser.id)
            }
            className="p-2"
          >
            <MaterialIcons name="more-vert" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.stars ? "star" : "star-outline"}
              size={18}
              color="#fbbf24"
            />
          ))}
          <Text className="ml-2 text-sm text-gray-600">Đã đánh giá</Text>
        </View>

        {item.content && (
          <Text className="text-gray-700 text-sm leading-5">
            {item.content}
          </Text>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="items-center py-20">
      <View className="bg-amber-100 rounded-2xl p-6 mb-4">
        <Ionicons name="star-outline" size={48} color="#f59e0b" />
      </View>
      <Text className="text-gray-600 text-center px-10">
        Bạn chưa đánh giá người dùng nào
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Đánh giá của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <FlatList
          data={ratings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRating}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
