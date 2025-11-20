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

// Cập nhật Type Filter: Thêm MANAGED
type FilterType = "ALL" | "MANAGED" | "PUBLIC" | "PRIVATE";

export default function YourGroupsTab({
  navigation,
  onJoinMorePress,
}: YourGroupsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State mới: Lấy ID người dùng hiện tại
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // State cho bộ lọc
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // 🔴 HÀM GIẢ ĐỊNH: Lấy User ID (Bạn cần thay thế bằng hàm lấy ID thật của bạn)
  const loadInitialData = async () => {
    // 1. Lấy Token
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để xem nhóm đã tham gia.");
      setLoading(false);
      return;
    }

    // 2. GIẢ ĐỊNH: Lấy User ID từ nơi lưu trữ (ví dụ từ AsyncStorage)
    // Hoặc bạn phải Decode Token để lấy ID
    const storedUserId = await AsyncStorage.getItem("userId");
    if (storedUserId) {
      setCurrentUserId(Number(storedUserId));
    }

    // 3. Fetch Groups
    try {
      const res = await axios.get(`${path}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      console.log("❌ Lỗi khi lấy nhóm:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInitialData();
  }, []);

  // 🚀 LOGIC LỌC NÂNG CẤP (Thêm Lọc theo MANAGED)
  const filteredGroups = useMemo(() => {
    let result = groups;

    // 1. Lọc theo loại (Public/Private/Managed)
    if (filterType === "PUBLIC") {
      result = result.filter((g) => g.isPublic === true);
    } else if (filterType === "PRIVATE") {
      result = result.filter((g) => !g.isPublic);
    } else if (filterType === "MANAGED") {
      // Lọc nhóm do người dùng hiện tại làm chủ
      if (currentUserId) {
        result = result.filter(
          (g) => Number(g.ownerId) === Number(currentUserId)
        );
      }
    }

    // 2. Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      result = result.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }
    return result;
  }, [groups, searchQuery, filterType, currentUserId]);

  // Hàm lấy tiêu đề hiển thị
  const getTitle = () => {
    switch (filterType) {
      case "PUBLIC":
        return "Nhóm công khai";
      case "PRIVATE":
        return "Nhóm riêng tư";
      case "MANAGED":
        return "Nhóm bạn quản lý";
      default:
        return "Tất cả nhóm của bạn";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER & MENU BUTTON */}
        <View className="flex-row justify-between items-center my-4 z-10 relative">
          <Text className="text-xl font-bold text-gray-900">{getTitle()}</Text>

          <TouchableOpacity
            onPress={() => setShowFilterMenu(!showFilterMenu)}
            className={`p-2 rounded-full ${showFilterMenu ? "bg-blue-100" : "bg-gray-200"}`}
          >
            <Feather
              name="filter"
              size={20}
              color={showFilterMenu ? "#2563eb" : "#374151"}
            />
          </TouchableOpacity>
        </View>

        {/* MENU OPTIONS (Hiện ra khi bấm nút Filter) */}
        {showFilterMenu && (
          <View className="flex-row flex-wrap justify-end mb-4 gap-2">
            <TouchableOpacity
              onPress={() => {
                setFilterType("ALL");
                setShowFilterMenu(false);
              }}
              className={`px-3 py-1.5 rounded-full border ${
                filterType === "ALL"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  filterType === "ALL" ? "text-white" : "text-gray-700"
                }`}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            {/* ✅ NÚT MỚI: QUẢN LÝ (MANAGED) */}
            <TouchableOpacity
              onPress={() => {
                setFilterType("MANAGED");
                setShowFilterMenu(false);
              }}
              className={`px-3 py-1.5 rounded-full border ${
                filterType === "MANAGED"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <View className="flex-row items-center">
                <Feather
                  name="star"
                  size={12}
                  color={filterType === "MANAGED" ? "white" : "#f59e0b"}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className={`text-xs font-medium ${filterType === "MANAGED" ? "text-white" : "text-gray-700"}`}
                >
                  Quản lý
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFilterType("PUBLIC");
                setShowFilterMenu(false);
              }}
              className={`px-3 py-1.5 rounded-full border ${
                filterType === "PUBLIC"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  filterType === "PUBLIC" ? "text-white" : "text-gray-700"
                }`}
              >
                Công khai
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFilterType("PRIVATE");
                setShowFilterMenu(false);
              }}
              className={`px-3 py-1.5 rounded-full border ${
                filterType === "PRIVATE"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  filterType === "PRIVATE" ? "text-white" : "text-gray-700"
                }`}
              >
                Riêng tư
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Thanh tìm kiếm */}
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 mb-4 h-11 shadow-sm">
          <Feather name="search" size={20} color="#9ca3af" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm tên nhóm bạn đã tham gia"
            className="flex-1 h-full ml-2 text-base text-gray-800"
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Hiển thị danh sách nhóm đã lọc */}
        {filteredGroups.length > 0 ? (
          <>
            {filteredGroups.map((g) => (
              <TouchableOpacity
                key={g.id}
                // Dùng style Card xịn hơn (mình đã gợi ý ở trên)
                className="flex-row p-4 mb-3 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50"
                onPress={() =>
                  navigation.navigate("GroupDetailScreen", { groupId: g.id })
                }
              >
                {/* --- AVATAR --- */}
                <Image
                  source={
                    g.image
                      ? { uri: g.image }
                      : require("../../../assets/defaultgroup.png")
                  }
                  className="w-16 h-16 rounded-2xl border border-gray-100 bg-gray-50"
                />

                {/* --- NỘI DUNG --- */}
                <View className="ml-4 flex-1 justify-center">
                  {/* Tên nhóm */}
                  <View className="flex-row justify-between items-start mb-1">
                    <Text
                      className="font-bold text-base text-gray-900 flex-1 mr-2"
                      numberOfLines={1}
                    >
                      {g.name}
                    </Text>
                  </View>

                  {/* Thành viên • Bài viết */}
                  <View className="flex-row items-center mb-2">
                    <Text className="text-xs text-gray-500 font-medium">
                      {g.memberCount} thành viên
                    </Text>
                    <Text className="text-xs text-gray-300 mx-1.5">•</Text>
                    <Text className="text-xs text-gray-500 font-medium">
                      {g.posts > 0 ? `${g.posts} bài viết` : "Chưa có bài"}
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    {/* Badge Duyệt bài */}
                    <View
                      className={`px-2 py-0.5 rounded-md ${
                        g.mustApprovePosts ? "bg-orange-50" : "bg-green-50"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold uppercase ${
                          g.mustApprovePosts
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {g.mustApprovePosts
                          ? "Có kiểm duyệt"
                          : "Không kiểm duyệt"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View className="items-center justify-center py-10 opacity-60">
            <Feather name="inbox" size={48} color="#9ca3af" />
            <Text className="text-center text-gray-500 mt-4 text-base">
              {filterType === "ALL"
                ? "Bạn chưa tham gia nhóm nào."
                : filterType === "MANAGED"
                  ? "Bạn chưa quản lý nhóm nào."
                  : `Không có nhóm ${filterType === "PUBLIC" ? "công khai" : "riêng tư"} nào.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
