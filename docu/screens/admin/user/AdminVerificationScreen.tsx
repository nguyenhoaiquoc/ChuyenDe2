import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { path } from "../../../config";

type PendingUser = {
  id: number;
  fullName: string;
  cccd_pending_data: {
    citizenId?: string;
    fullName?: string;
    dob?: string;
    gender?: string;
    hometown?: string;
    imageUrl?: string;
    submittedAt?: string;
  };
};

export default function AdminVerificationScreen() {
  const [requests, setRequests] = useState<PendingUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${path}/admin/pending-cccd`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (userId: number) => {
    Alert.alert("Xác nhận", "Phê duyệt yêu cầu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Phê duyệt",
        onPress: async () => {
          setLoading(true);
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.patch(`${path}/admin/approve/${userId}`, {}, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Thành công", "Đã phê duyệt");
            fetchRequests();
          } catch (err) {
            Alert.alert("Lỗi", "Không thể phê duyệt");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleReject = async (userId: number) => {
    Alert.alert("Xác nhận", "Từ chối yêu cầu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Từ chối",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.patch(`${path}/admin/reject/${userId}`, {}, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Đã từ chối");
            fetchRequests();
          } catch (err) {
            Alert.alert("Lỗi", "Không thể từ chối");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: PendingUser }) => {
    const pending = item.cccd_pending_data;
    return (
      <View className="bg-white p-4 m-4 rounded-xl shadow">
        <View className="flex-row gap-4">
          <Image
            source={{ uri: pending.imageUrl || "https://via.placeholder.com/60" }}
            className="w-16 h-16 rounded-full"
          />
          <View className="flex-1">
            <Text className="font-bold text-lg">{pending.fullName || item.fullName}</Text>
            <Text className="text-gray-500 text-xs">
              {pending.submittedAt
                ? new Date(pending.submittedAt).toLocaleString("vi-VN")
                : ""}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <Text>ID CCCD: {pending.citizenId || "-"}</Text>
          <Text>Hometown: {pending.hometown || "-"}</Text>
          <Text>Gender: {pending.gender || "-"}</Text>
          <Text>DOB: {pending.dob ? new Date(pending.dob).toLocaleDateString() : "-"}</Text>
        </View>

        <View className="flex-row gap-4 mt-6">
          <TouchableOpacity
            onPress={() => handleApprove(item.id)}
            className="flex-1 bg-green-600 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold">Phê duyệt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleReject(item.id)}
            className="flex-1 bg-red-600 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold">Từ chối</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchRequests} />}
      ListEmptyComponent={
        <Text className="text-center text-gray-500 mt-10">
          Không có yêu cầu nào đang chờ duyệt
        </Text>
      }
    />
  );
}
