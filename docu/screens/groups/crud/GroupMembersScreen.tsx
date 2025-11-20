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
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";

type Props = NativeStackScreenProps<RootStackParamList, "GroupMembersScreen">;

export default function GroupMembersScreen({ navigation, route }: Props) {
  const { groupId, isLeader } = route.params;

  const [activeTab, setActiveTab] = useState<"members" | "pending">("members");
  const [members, setMembers] = useState<any[]>([]);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const [membersRes, pendingRes] = await Promise.all([
        axios.get(`${path}/groups/${groupId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        isLeader
          ? axios.get(`${path}/groups/${groupId}/pending-members`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: [] }),
      ]);

      setMembers(membersRes.data);
      setPendingMembers(pendingRes.data);
    } catch (error: any) {
      console.error("Lỗi tải danh sách thành viên:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải danh sách thành viên"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApproveMember = async (userId: number, approve: boolean) => {
    const action = approve ? "duyệt" : "từ chối";
    Alert.alert(
      `Xác nhận ${action}`,
      `Bạn có chắc chắn muốn ${action} thành viên này?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: approve ? "Duyệt" : "Từ chối",
          style: approve ? "default" : "destructive",
          onPress: async () => {
            setProcessing(userId);
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await axios.post(
                `${path}/groups/${groupId}/members/${userId}/approve`,
                { approve },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              Alert.alert("Thành công", res.data.message);
              await fetchData();
            } catch (error: any) {
              Alert.alert(
                "Lỗi",
                error.response?.data?.message ||
                  `Không thể ${action} thành viên`
              );
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (userId: number) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(
                `${path}/groups/${groupId}/members/${userId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              Alert.alert("Thành công", "Đã xóa thành viên khỏi nhóm");
              setMenuVisible(false);
              await fetchData();
            } catch (error: any) {
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể xóa thành viên"
              );
            }
          },
        },
      ]
    );
  };

  const handleTransferLeadership = async (userId: number) => {
    Alert.alert(
      "Xác nhận chuyển quyền",
      "Bạn sẽ trở thành thành viên thông thường. Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chuyển quyền",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.post(
                `${path}/groups/${groupId}/transfer-leadership`,
                { newLeaderId: userId },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              Alert.alert("Thành công", "Đã chuyển quyền trưởng nhóm");
              setMenuVisible(false);
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

  const openMemberMenu = (member: any) => {
    if (!isLeader || member.role === "leader") return;
    setSelectedMember(member);
    setMenuVisible(true);
  };

  const renderMemberItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => openMemberMenu(item)}
      disabled={!isLeader || item.role === "leader"}
      className="flex-row items-center p-3 bg-white border-b border-gray-100"
    >
      <Image
        source={
          item.avatar
            ? { uri: item.avatar }
            : require("../../../assets/khi.png")
        }
        className="w-12 h-12 rounded-full"
      />
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-gray-900">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.email}</Text>
      </View>
      <View
        className={`px-3 py-1 rounded-full ${
          item.role === "leader" ? "bg-green-500/10" : "bg-blue-500/10"
        }`}
      >
        <Text
          className={`text-xs font-semibold ${
            item.role === "leader" ? "text-green-700" : "text-blue-700"
          }`}
        >
          {item.roleName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPendingItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center p-3 bg-white border-b border-gray-100">
      <Image
        source={
          item.avatar
            ? { uri: item.avatar }
            : require("../../../assets/khi.png")
        }
        className="w-12 h-12 rounded-full"
      />
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-gray-900">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.email}</Text>
        <Text className="text-xs text-gray-400 mt-1">
          {new Date(item.requested_at).toLocaleDateString("vi-VN")}
        </Text>
      </View>
      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={() => handleApproveMember(item.user_id, false)}
          disabled={processing === item.user_id}
          className="bg-red-500 px-3 py-2 rounded-lg"
        >
          {processing === item.user_id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Feather name="x" size={16} color="white" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleApproveMember(item.user_id, true)}
          disabled={processing === item.user_id}
          className="bg-green-500 px-3 py-2 rounded-lg"
        >
          {processing === item.user_id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Feather name="check" size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center p-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold ml-4">Thành viên</Text>
        </View>

        {/* Tabs */}
        {isLeader && (
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setActiveTab("members")}
              className={`flex-1 py-3 items-center ${
                activeTab === "members"
                  ? "border-b-2 border-blue-500"
                  : "border-b border-gray-200"
              }`}
            >
              <Text
                className={`font-semibold ${
                  activeTab === "members" ? "text-blue-500" : "text-gray-500"
                }`}
              >
                Thành viên ({members.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("pending")}
              className={`flex-1 py-3 items-center ${
                activeTab === "pending"
                  ? "border-b-2 border-blue-500"
                  : "border-b border-gray-200"
              }`}
            >
              <Text
                className={`font-semibold ${
                  activeTab === "pending" ? "text-blue-500" : "text-gray-500"
                }`}
              >
                Chờ duyệt ({pendingMembers.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {activeTab === "members" ? (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMemberItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Feather name="users" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">Chưa có thành viên</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={pendingMembers}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={renderPendingItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Feather name="clock" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">
                Không có yêu cầu chờ duyệt
              </Text>
            </View>
          }
        />
      )}

      {/* Member Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white rounded-lg w-80 overflow-hidden">
              <View className="p-4 border-b border-gray-100">
                <Text className="text-lg font-semibold text-gray-900">
                  {selectedMember?.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {selectedMember?.email}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleTransferLeadership(selectedMember?.id)}
                className="flex-row items-center p-4 border-b border-gray-100"
              >
                <Feather name="award" size={20} color="#3B82F6" />
                <Text className="ml-3 text-base text-gray-900">
                  Chuyển quyền trưởng nhóm
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRemoveMember(selectedMember?.id)}
                className="flex-row items-center p-4"
              >
                <Feather name="user-x" size={20} color="#EF4444" />
                <Text className="ml-3 text-base text-red-600">
                  Xóa khỏi nhóm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
