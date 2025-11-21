import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { path } from "../../../config";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type PendingUser = {
  id: number;
  fullName: string;
  cccd_pending_data: {
    citizenId?: string;
    fullName?: string;
    dob?: string;
    gender?: string;
    hometown?: string;
    address?: string;
    imageUrl?: string;
    submittedAt?: string;
  };
};

export default function AdminVerificationScreen() {
  const [requests, setRequests] = useState<PendingUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingAction, setLoadingAction] = useState<number | null>(null); // đang xử lý user nào

  const fetchRequests = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Phiên đăng nhập hết hạn");
        return;
      }

      const res = await axios.get(`${path}/admin/pending-cccd`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      setRequests(res.data || []);
    } catch (err: any) {
      console.error("Lỗi tải danh sách chờ duyệt:", err);
      const msg = err.response?.data?.message || "Không thể kết nối server";
      Alert.alert("Lỗi", msg);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (
    userId: number,
    action: "approve" | "reject",
    fullName: string
  ) => {
    const actionText = action === "approve" ? "Phê duyệt" : "Từ chối";
    const successMsg = action === "approve" ? "Đã phê duyệt thành công!" : "Đã từ chối yêu cầu";

    Alert.alert(
      actionText,
      `${actionText} thông tin CCCD của\n"${fullName}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: actionText,
          style: action === "approve" ? "default" : "destructive",
          onPress: async () => {
            setLoadingAction(userId);
            try {
              const token = await AsyncStorage.getItem("token");
              const endpoint =
                action === "approve"
                  ? `${path}/admin/approve/${userId}`
                  : `${path}/admin/reject/${userId}`;

              await axios.patch(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
              });

              Alert.alert("Thành công", successMsg);
              fetchRequests(); // refresh danh sách
            } catch (err: any) {
              const msg = err.response?.data?.message || `Không thể ${actionText.toLowerCase()}`;
              Alert.alert("Lỗi", msg);
            } finally {
              setLoadingAction(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: PendingUser }) => {
    const p = item.cccd_pending_data;
    const isLoading = loadingAction === item.id;

    return (
      <View className="bg-white mx-4 mb-4 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
          <View className="flex-row items-center gap-4">
            <Image
              source={{
                uri: p.imageUrl || "https://via.placeholder.com/80",
              }}
              className="w-20 h-20 rounded-full border-4 border-white"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">
                {p.fullName || item.fullName || "Không có tên"}
              </Text>
              <Text className="text-white/80 text-xs">
                Gửi lúc: {p.submittedAt ? format(new Date(p.submittedAt), "HH:mm, dd/MM/yyyy", { locale: vi }) : "Không rõ"}
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin */}
        <View className="p-5 space-y-2">
          <InfoRow label="Số CCCD" value={p.citizenId} />
          <InfoRow label="Họ tên" value={p.fullName} />
          <InfoRow label="Giới tính" value={p.gender === "Nam" ? "Nam" : p.gender === "Nữ" ? "Nữ" : p.gender} />
          <InfoRow label="Ngày sinh" value={p.dob ? format(new Date(p.dob), "dd/MM/yyyy") : null} />
          <InfoRow label="Quê quán" value={p.hometown} />
          <InfoRow label="Nơi thường trú" value={p.address} />
        </View>

        {/* Nút hành động */}
        <View className="flex-row px-5 pb-5 gap-3">
          <TouchableOpacity
            onPress={() => handleAction(item.id, "approve", p.fullName || item.fullName)}
            disabled={isLoading}
            className="flex-1 bg-green-600 py-4 rounded-xl flex-row justify-center items-center"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Phê duyệt</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAction(item.id, "reject", p.fullName || item.fullName)}
            disabled={isLoading}
            className="flex-1 bg-red-600 py-4 rounded-xl flex-row justify-center items-center"
          >
            <Text className="text-white font-bold text-lg">Từ chối</Text>
          </TouchableOpacity>
        </View>

        {/* Xem ảnh CCCD lớn */}
        {p.imageUrl && (
          <TouchableOpacity
            onPress={() => Linking.openURL(p.imageUrl!)}
            className="bg-gray-100 px-5 py-3 border-t border-gray-200"
          >
            <Text className="text-center text-blue-600 font-medium">
              Xem ảnh CCCD gốc
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchRequests} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-500 text-lg">
              Không có yêu cầu nào đang chờ duyệt
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
      />
    </View>
  );
}

// Component nhỏ để hiển thị dòng thông tin
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <View className="flex-row">
      <Text className="text-gray-600 font-medium w-32">{label}:</Text>
      <Text className="text-gray-900 flex-1 font-medium">{value}</Text>
    </View>
  );
};