import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { RootStackParamList } from "../../../types";
import axios from "axios";
import { path } from "../../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// const groups = [
//   {
//     id: 1,
//     name: "Hội những người yêu chó",
//     members: "72.203 thành viên",
//     posts: "12 bài viết mới hôm nay",
//     image: require("../../../assets/khi.png"),
//   },
// ];

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

  useEffect(() => {
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
        console.error(" Lỗi khi lấy nhóm đã tham gia:", err);
      } finally {
        setLoading(false);
      }
    };

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
  return (
    <ScrollView
      className="flex-1 px-4 pb-24"
      showsVerticalScrollIndicator={false}
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
              className="flex-row items-center mb-4 p-2 bg-gray-50 rounded-lg"
              // onPress={() =>
              //   navigation.navigate("GroupDetailScreen", { group: g })
              // }
            >
              <Image
                source={
                  g.image
                    ? { uri: g.image }
                    : require("../../../assets/khi.png")
                }
                className="w-14 h-14 rounded-lg"
              />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-base">{g.name}</Text>
                <Text className="text-gray-500 text-sm">{g.members}</Text>
                <Text className="text-green-300 text-xs font-medium">
                  {g.posts}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <View className="items-center py-20">
            <TouchableOpacity onPress={onJoinMorePress} className="mt-4 mb-3">
              <Text className="text-blue-500 text-sm font-medium text-center">
                Xem các nhóm có thể bạn thích
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // Hiển thị thông báo khi không có kết quả
        <Text className="text-center text-gray-500 my-8">
          Không tìm thấy nhóm nào phù hợp.
        </Text>
      )}
    </ScrollView>
  );
}
