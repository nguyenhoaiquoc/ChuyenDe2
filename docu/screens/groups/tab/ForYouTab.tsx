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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ForYouTabProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onViewAllPress: () => void;
  onJoinMorePress: () => void;
};

export default function ForYouTab({
  navigation,
  onViewAllPress,
  onJoinMorePress,
}: ForYouTabProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const [groupRes, postRes] = await Promise.all([
          axios.get(`${path}/groups/latest`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${path}/groups/my/group-posts?limit=4`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
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
      <View className=" mb-2 mt-7 ">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base font-semibold">Nhóm của bạn</Text>
          {groups.length >= 5 ? (
            <TouchableOpacity onPress={onViewAllPress}>
              <Text className="text-blue-500 text-sm font-medium">
                Xem tất cả
              </Text>
            </TouchableOpacity>
          ) : null}
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

        {groups.length < 5 ? (
          <TouchableOpacity onPress={onJoinMorePress} className="mt-4 mb-3">
            <Text className="text-blue-500 text-sm font-medium text-center">
              Xem các nhóm có thể bạn thích
            </Text>
          </TouchableOpacity>
        ) : null}
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

                {/* Tên người đnăg */}
                <Text className="font-semibold text-sm mt-2" numberOfLines={1}>
                  {item.authorName}
                </Text>

                {/* Tiêu đề */}
                <Text className="font-semibold text-sm mt-2" numberOfLines={1}>
                  {item.name}
                </Text>

                {/* Giá + vị trí */}
                <Text className="text-gray-500 text-xs">
                  {item.price ? `${item.price}` : "Thỏa thuận"}
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
