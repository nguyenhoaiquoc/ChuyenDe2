import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { path } from "../../../config";

type Request = {
    _id: string;
    userId: { _id: string; nickname: string; image?: string };
    citizenCard: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
};

export default function AdminVerificationScreen() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await axios.get(`${path}/admin/cccd-verification-requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(res.data);
        } catch (err) {
            Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (requestId: string) => {
        Alert.alert("Xác nhận", "Phê duyệt yêu cầu này?", [
            {
                text: "Hủy",
                style: "cancel",
            },
            {
                text: "Phê duyệt",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        await axios.patch(
                            `${path}/admin/cccd-verification-requests/${requestId}/approve`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        Alert.alert("Thành công", "Đã phê duyệt");
                        fetchRequests();
                    } catch (err) {
                        Alert.alert("Lỗi", "Không thể phê duyệt");
                    }
                },
            },
        ]);
    };

    const handleReject = async (requestId: string) => {
        Alert.alert("Xác nhận", "Từ chối yêu cầu này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Từ chối",
                style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        await axios.patch(
                            `${path}/admin/cccd-verification-requests/${requestId}/reject`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        Alert.alert("Đã từ chối");
                        fetchRequests();
                    } catch (err) {
                        Alert.alert("Lỗi", "Không thể từ chối");
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: Request }) => (
        <View className="bg-white p-4 m-4 rounded-xl shadow">
            <View className="flex-row gap-4">
                <Image
                    source={{ uri: item.userId.image || "https://via.placeholder.com/60" }}
                    className="w-16 h-16 rounded-full"
                />
                <View className="flex-1">
                    <Text className="font-bold text-lg">{item.userId.nickname}</Text>
                    <Text className="text-gray-500 text-xs">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </Text>
                </View>
            </View>

            <Image
                source={{ uri: item.citizenCard }}
                className="w-full h-64 rounded-lg mt-4"
                resizeMode="contain"
            />

            <View className="flex-row gap-4 mt-6">
                <TouchableOpacity
                    onPress={() => handleApprove(item._id)}
                    className="flex-1 bg-green-600 py-3 rounded-lg"
                >
                    <Text className="text-white text-center font-bold">Phê duyệt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleReject(item._id)}
                    className="flex-1 bg-red-600 py-3 rounded-lg"
                >
                    <Text className="text-white text-center font-bold">Từ chối</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <FlatList
            data={requests.filter((r) => r.status === "pending")}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchRequests} />
            }
            ListEmptyComponent={
                requests.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">
                        Không có yêu cầu nào đang chờ duyệt
                    </Text>
                ) : null
            }
        />
    );
}