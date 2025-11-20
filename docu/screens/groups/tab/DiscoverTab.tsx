import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../../config";
import { GroupType, RootStackParamList } from "../../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type JoinStatus = "none" | "pending" | "joined";

const GroupSuggestionCard = ({
  group,
  onJoin,
}: {
  group: GroupType;
  onJoin: (groupId: number) => void;
}) => {
  const navigation = useNavigation<NavigationProp>();

  const renderBadge = () => {
    if (group.joinStatus === "joined") {
      return (
        <View className="mt-2 bg-green-500/80 px-3 py-1 rounded-full self-start">
          <Text className="text-white text-xs font-semibold">Đã tham gia</Text>
        </View>
      );
    }
    if (group.joinStatus === "pending") {
      return (
        <View className="mt-2 bg-yellow-500/80 px-3 py-1 rounded-full self-start">
          <Text className="text-white text-xs font-semibold">
            Chờ phê duyệt
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View className="w-[48%] mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("GroupDetailScreen", {
            groupId: group.id,
            initialJoinStatus: group.joinStatus,
          })
        }
      >
        <ImageBackground
          source={
            typeof group.image === "string" ? { uri: group.image } : group.image
          }
          className="h-28 w-full"
          imageStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        />
      </TouchableOpacity>

      <View className="p-3">
        <Text className="font-bold text-sm leading-5" numberOfLines={2}>
          {group.name}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {group.isPublic ? "Nhóm Công khai" : "Nhóm Riêng tư"} ·{" "}
        </Text>

        {renderBadge()}

        {group.joinStatus === "none" && (
          <TouchableOpacity
            className="bg-blue-100 mt-3 py-2 rounded-md"
            onPress={() => onJoin(group.id)}
          >
            <Text className="text-blue-600 font-semibold text-center text-sm">
              {group.isPublic ? "Tham gia nhóm" : "Gửi yêu cầu"}
            </Text>
          </TouchableOpacity>
        )}

        {group.joinStatus === "pending" && (
          <TouchableOpacity
            className="bg-blue-100 mt-3 py-2 rounded-md"
            onPress={() => onJoin(group.id)} // gọi lại handleJoin để hủy
          >
            <Text className="text-yellow-600 font-semibold text-center text-sm">
              Hủy yêu cầu
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function DiscoverTab() {
  const [suggestedGroups, setSuggestedGroups] = useState<GroupType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSuggestedGroups = useCallback(async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");

    try {
      const res = await axios.get(`${path}/groups/suggestions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const mapped: GroupType[] = res.data.map((g: any) => ({
        id: g.id,
        name: g.name,
        image: g.image || require("../../../assets/defaultgroup.png"),
        description: g.description || "",
        memberCount: g.memberCount ?? 0,
        joinStatus: g.joinStatus as JoinStatus,
        isPublic: g.isPublic,
        mustApprovePosts: g.mustApprovePosts ?? false,
      }));

      setSuggestedGroups(mapped);
    } catch (err) {
      console.log("❌ Lỗi lấy nhóm gợi ý:", err);
      setSuggestedGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestedGroups();
  }, [fetchSuggestedGroups]);

  const handleJoin = async (groupId: number) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để tham gia nhóm");
      return;
    }

    try {
      // ✅ Tìm nhóm hiện tại để kiểm tra trạng thái
      const currentGroup = suggestedGroups.find((g) => g.id === groupId);

      // ✅ Nếu đang "pending" → Hủy yêu cầu
      if (currentGroup?.joinStatus === "pending") {
        await axios.delete(`${path}/groups/${groupId}/cancel-request`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Refresh danh sách
        await fetchSuggestedGroups();
        return;
      }

      // ✅ Nếu "none" → Gửi yêu cầu tham gia
      const res = await axios.post(
        `${path}/groups/${groupId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh danh sách
      await fetchSuggestedGroups();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể thực hiện thao tác";
      Alert.alert("Lỗi", msg);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-3 text-gray-600">Đang tải nhóm gợi ý...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 mb-10"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await fetchSuggestedGroups();
            setRefreshing(false);
          }}
          colors={["#3B82F6"]}
          tintColor="#3B82F6"
        />
      }
    >
      <View className="p-4">
        <Text className="text-lg font-bold mb-3">Gợi ý cho bạn</Text>

        {suggestedGroups.length === 0 ? (
          <View className="items-center py-10">
            <Feather name="users" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-3 text-center">
              Không có nhóm gợi ý nào
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {suggestedGroups.map((group) => (
              <GroupSuggestionCard
                key={group.id}
                group={group}
                onJoin={handleJoin}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
