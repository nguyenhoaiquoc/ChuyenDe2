import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";

type GroupMembersScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "GroupMembersScreen"
>;

export default function GroupMembersScreen({
  navigation,
  route,
}: GroupMembersScreenProps) {
  const { groupId, isLeader } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "pending">("members");
  const [members, setMembers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (activeTab === "members") {
        // Lấy danh sách thành viên (pending = 3)
        const res = await axios.get(`${path}/groups/${groupId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data);
        setPendingRequests([]);
      } else {
        // Lấy danh sách chờ duyệt (pending = 2)
        const res = await axios.get(
          `${path}/groups/${groupId}/pending-members`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPendingRequests(res.data);
        setMembers([]);
      }
    } catch (error: any) {
      console.error("Lỗi tải dữ liệu:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  };

  /** Duyệt yêu cầu tham gia (pending: 2 → 3) */
  const handleApproveRequest = (userId: number, name: string) => {
    console.log("🔍 Approve request:", { groupId, userId, name });

    Alert.alert("Duyệt yêu cầu", `Cho phép ${name} tham gia nhóm?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Duyệt",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const url = `${path}/groups/${groupId}/members/${userId}/approve`;
            console.log("📡 API URL:", url);

            const response = await axios.post(
              url,
              { approve: true },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("✅ Response:", response.data);
            Alert.alert("Thành công", `${name} đã được thêm vào nhóm`);
            fetchData();
          } catch (error: any) {
            console.error("❌ Error:", error.response?.data || error.message);
            Alert.alert(
              "Lỗi",
              error.response?.data?.message || "Không thể duyệt yêu cầu"
            );
          }
        },
      },
    ]);
  };

  /** Từ chối yêu cầu (xóa pending = 2) */
  const handleRejectRequest = (userId: number, name: string) => {
    Alert.alert("Từ chối yêu cầu", `Từ chối ${name} tham gia nhóm?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Từ chối",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.post(
              `${path}/groups/${groupId}/members/${userId}/approve`,
              { approve: false },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert("Đã từ chối", `${name} đã bị xóa khỏi danh sách chờ`);
            fetchData();
          } catch (error: any) {
            Alert.alert(
              "Lỗi",
              error.response?.data?.message || "Không thể từ chối"
            );
          }
        },
      },
    ]);
  };

  /** Xóa thành viên khỏi nhóm (xóa pending = 3) */
  const handleRemoveMember = (userId: number, name: string) => {
    Alert.alert("Xóa thành viên", `Xóa ${name} khỏi nhóm?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(`${path}/groups/${groupId}/members/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Thành công", "Đã xóa thành viên");
            fetchData();
          } catch (error: any) {
            Alert.alert(
              "Lỗi",
              error.response?.data?.message || "Không thể xóa"
            );
          }
        },
      },
    ]);
  };

  /** Chuyển quyền trưởng nhóm */
  const handleTransferLeadership = (userId: number, name: string) => {
    Alert.alert(
      "Chuyển quyền trưởng nhóm",
      `Chuyển quyền cho ${name}?\n\nBạn sẽ trở thành thành viên thường.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "default",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.post(
                `${path}/groups/${groupId}/transfer-leadership`,
                { newLeaderId: userId },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert("Thành công", "Đã chuyển quyền trưởng nhóm");
              navigation.goBack();
            } catch (error: any) {
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể chuyển quyền"
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-3 text-gray-600">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  const data = activeTab === "members" ? members : pendingRequests;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-3">
          {activeTab === "members"
            ? `Thành viên (${members.length})`
            : `Yêu cầu (${pendingRequests.length})`}
        </Text>
      </View>

      {/* Tabs - chỉ hiển thị cho leader */}
      {isLeader && (
        <View className="flex-row bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => setActiveTab("members")}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === "members" ? "border-blue-600" : "border-transparent"
            }`}
          >
            <Text
              className={`font-semibold ${
                activeTab === "members" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Thành viên
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("pending")}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === "pending" ? "border-blue-600" : "border-transparent"
            }`}
          >
            <View className="flex-row items-center">
              <Text
                className={`font-semibold ${
                  activeTab === "pending" ? "text-blue-600" : "text-gray-600"
                }`}
              >
                Yêu cầu
              </Text>
              {pendingRequests.length > 0 && activeTab !== "pending" && (
                <View className="ml-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {pendingRequests.length}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item: any) => String(item.id || item.user_id)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center py-10">
            <Feather name="users" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-3">
              {activeTab === "members"
                ? "Chưa có thành viên nào"
                : "Chưa có yêu cầu tham gia"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const userId = item.id || item.user_id;
          const name = item.name || item.user?.name || "Người dùng";
          const avatar = item.avatar || item.user?.avatar;

          return (
            <View className="bg-white mb-3 rounded-lg p-4 flex-row items-center shadow-sm">
              <Image
                source={
                  avatar ? { uri: avatar } : require("../../../assets/khi.png")
                }
                className="w-12 h-12 rounded-full"
              />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-gray-900">{name}</Text>
                <Text className="text-xs text-gray-500">
                  {activeTab === "pending"
                    ? "Chờ phê duyệt"
                    : item.role === "leader"
                      ? "Trưởng nhóm"
                      : "Thành viên"}
                </Text>
              </View>

              {/* Actions cho thành viên (pending = 3) */}
              {isLeader &&
                activeTab === "members" &&
                item.role !== "leader" && (
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() => handleTransferLeadership(userId, name)}
                      className="bg-blue-50 p-2 rounded-lg"
                    >
                      <Feather name="shield" size={18} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(userId, name)}
                      className="bg-red-50 p-2 rounded-lg"
                    >
                      <Feather name="user-x" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}

              {/* Actions cho yêu cầu chờ duyệt (pending = 2) */}
              {isLeader && activeTab === "pending" && (
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => handleApproveRequest(userId, name)}
                    className="bg-green-50 p-2 rounded-lg"
                  >
                    <Feather name="check" size={18} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRejectRequest(userId, name)}
                    className="bg-red-50 p-2 rounded-lg"
                  >
                    <Feather name="x" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
