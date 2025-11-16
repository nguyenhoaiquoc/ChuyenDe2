import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";

type Props = NativeStackScreenProps<RootStackParamList, "InviteMembersScreen">;

export default function InviteMembersScreen({ navigation, route }: Props) {
  const { groupId } = route.params;

  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  const fetchUsers = async (query: string = "") => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${path}/groups/${groupId}/users-to-invite`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: query },
      });
      setAvailableUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchUsers(text);
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một người để mời");
      return;
    }

    setInviting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${path}/groups/${groupId}/invite`,
        { inviteeIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", res.data.message);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể gửi lời mời"
      );
    } finally {
      setInviting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold ml-4">Mời thành viên</Text>
        </View>
        {selectedUsers.length > 0 && (
          <TouchableOpacity
            onPress={handleInvite}
            disabled={inviting}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            {inviting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold">
                Mời ({selectedUsers.length})
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Feather name="search" size={20} color="gray" />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="flex-1 ml-2 text-base"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Feather name="x-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={availableUsers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const isSelected = selectedUsers.includes(item.id);
            return (
              <TouchableOpacity
                onPress={() => handleToggleUser(item.id)}
                className={`flex-row items-center justify-between py-3 px-4 mb-2 rounded-lg ${
                  isSelected
                    ? "bg-blue-50 border border-blue-300"
                    : "bg-gray-50"
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <Image
                    source={
                      item.avatar
                        ? { uri: item.avatar }
                        : require("../../../assets/khi.png")
                    }
                    className="w-12 h-12 rounded-full"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-semibold text-gray-900">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-gray-500">{item.email}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View className="bg-blue-500 w-6 h-6 rounded-full items-center justify-center">
                    <Feather name="check" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <Feather name="users" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-3 text-center">
                {searchQuery
                  ? "Không tìm thấy người dùng phù hợp"
                  : "Không có người dùng để mời"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
