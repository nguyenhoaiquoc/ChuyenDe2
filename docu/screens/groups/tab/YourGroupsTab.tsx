import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { RootStackParamList } from "../../../types";
import axios from "axios";
import { path } from "../../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

type YourGroupsTabProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onJoinMorePress: () => void;
};

export default function YourGroupsTab({
  navigation,
  onJoinMorePress,
}: YourGroupsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để xem nhóm đã tham gia.");
      return;
    }

    try {
      const res = await axios.get(`${path}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      console.log("❌ Lỗi khi lấy nhóm đã tham gia:", err);
    } finally {
      setLoading(false);
      setRefreshing(false); // 👈 reset refreshing
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroups();
  }, []);

  //  Lọc danh sách nhóm dựa trên searchQuery
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groups;
    }
    return groups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [groups, searchQuery]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4 pb-24"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text className="text-lg font-bold my-4">Tất cả nhóm của bạn</Text>

      {/* Thanh tìm kiếm */}
      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 mb-4">
        <Feather name="search" size={20} color="gray" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm tên nhóm"
          className="flex-1 h-10 ml-2 text-sm"
        />
      </View>

      {/* Hiển thị danh sách nhóm đã lọc */}
      {filteredGroups.length > 0 ? (
        <>
          {filteredGroups.map((g) => (
            <TouchableOpacity
              key={g.id}
              className="flex-row items-center p-4 my-4 bg-white rounded-xl border-gray-500 shadow-sm"
              onPress={() =>
                navigation.navigate("GroupDetailScreen", { group: g })
              }
            >
              <Image
                source={
                  g.image
                    ? { uri: g.image }
                    : require("../../../assets/khi.png")
                }
                className="w-16 h-16 rounded-full"
              />
              <View className="ml-4 flex-1">
                <Text className="font-bold text-lg text-gray-800">
                  {g.name}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {g.memberCount} thành viên
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {g.posts > 0 ? `${g.posts} bài viết` : "Chưa có bài viết"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <View className="items-center pb-24">
            <TouchableOpacity onPress={onJoinMorePress} className="mt-4 mb-3">
              <Text className="text-blue-600 text-base font-medium text-center">
                Xem các nhóm có thể bạn thích
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text className="text-center text-gray-500 my-10 text-base">
          Không tìm thấy nhóm nào phù hợp.
        </Text>
      )}
    </ScrollView>
  );
}
