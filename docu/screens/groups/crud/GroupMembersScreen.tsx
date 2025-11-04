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

type GroupMembersScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "GroupMembersScreen"
>;

export default function GroupMembersScreen({
  navigation,
  route,
}: GroupMembersScreenProps) {
  const { groupId, isLeader } = route.params;

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${path}/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch (error: any) {
      console.error("Lỗi tải thành viên:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách thành viên");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (userId: number, name: string) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa ${name} khỏi nhóm?`,
      [
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
              fetchMembers();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa thành viên");
            }
          },
        },
      ]
    );
  };

  const handleTransferLeadership = (userId: number, name: string) => {
    Alert.alert(
      "Chuyển quyền trưởng nhóm",
      `Bạn có chắc muốn chuyển quyền trưởng nhóm cho ${name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
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
            } catch (error) {
              Alert.alert("Lỗi", "Không thể chuyển quyền");
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
          Thành viên ({members.length})
        </Text>
      </View>

      {/* Members List */}
      <FlatList
        data={members}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-white mb-3 rounded-lg p-4 flex-row items-center">
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
              <View className="flex-row items-center mt-1">
                {item.role === "leader" ? (
                  <View className="bg-green-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-xs font-semibold">
                      Trưởng nhóm
                    </Text>
                  </View>
                ) : (
                  <Text className="text-gray-500 text-xs">Thành viên</Text>
                )}
              </View>
            </View>

            {/* Leader Actions */}
            {isLeader && item.role !== "leader" && (
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => handleTransferLeadership(item.id, item.name)}
                  className="bg-blue-50 p-2 rounded-lg"
                >
                  <Feather name="shield" size={18} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveMember(item.id, item.name)}
                  className="bg-red-50 p-2 rounded-lg"
                >
                  <Feather name="user-x" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}