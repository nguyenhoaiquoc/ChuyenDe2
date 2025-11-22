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
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { path } from "../../../config";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../types";

type UserListItem = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  image: string | null;
  is_cccd_verified: boolean;
  roleId: number;
  createdAt: string;
};

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
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [requests, setRequests] = useState<PendingUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingAction, setLoadingAction] = useState<number | null>(null); // đang xử lý user nào

  const [activeTab, setActiveTab] = useState<"pending" | "users">("pending"); // Tab hiện tại

  // State cho Tab Danh sách User
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // State cho Modal chi tiết
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const fetchUsers = useCallback(
    async (isLoadMore = false) => {
      if (loadingUsers) return;
      setLoadingUsers(true);
      try {
        const token = await AsyncStorage.getItem("token");
        // Gọi API với search & page
        const res = await axios.get(`${path}/admin/users`, {
          params: {
            page: isLoadMore ? page + 1 : 1,
            limit: 10,
            search: searchQuery,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isLoadMore) {
          setUsers((prev) => [...prev, ...res.data.data]);
          setPage((prev) => prev + 1);
        } else {
          setUsers(res.data.data);
          setPage(1);
        }
        setTotalPages(res.data.last_page);
      } catch (err) {
        console.error("Lỗi tải user:", err);
      } finally {
        setLoadingUsers(false);
        setRefreshing(false);
      }
    },
    [searchQuery, page]
  );

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, searchQuery]);

  const handleOpenDetail = async (userId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${path}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(res.data);
      setModalVisible(true);
    } catch (err) {
      Alert.alert("Lỗi", "Không tải được chi tiết người dùng");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (
    userId: number,
    action: "approve" | "reject",
    fullName: string
  ) => {
    const actionText = action === "approve" ? "Phê duyệt" : "Từ chối";
    const successMsg =
      action === "approve" ? "Đã phê duyệt thành công!" : "Đã từ chối yêu cầu";

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

              await axios.patch(
                endpoint,
                {},
                {
                  headers: { Authorization: `Bearer ${token}` },
                  timeout: 10000,
                }
              );

              Alert.alert("Thành công", successMsg);
              fetchRequests(); // refresh danh sách
            } catch (err: any) {
              const msg =
                err.response?.data?.message ||
                `Không thể ${actionText.toLowerCase()}`;
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

  // Hàm xóa user
  const handleDeleteUser = (userId: number, userName: string) => {
    Alert.alert(
      "CẢNH BÁO QUAN TRỌNG",
      `Bạn có chắc chắn muốn xóa vĩnh viễn người dùng "${userName}"?\n\nHành động này sẽ xóa toàn bộ:\n- Thông tin tài khoản\n- Tất cả bài đăng của họ\n\nKhông thể khôi phục sau khi xóa!`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "XÓA VĨNH VIỄN",
          style: "destructive", // Màu đỏ trên iOS
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(`${path}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              Alert.alert("Thành công", "Đã xóa người dùng.");
              setModalVisible(false); // Đóng modal
              fetchUsers(); // Load lại danh sách
            } catch (err: any) {
              console.error(err);
              Alert.alert(
                "Lỗi",
                "Không thể xóa người dùng này. Hãy kiểm tra lại server."
              );
            }
          },
        },
      ]
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
                Gửi lúc:{" "}
                {p.submittedAt
                  ? format(new Date(p.submittedAt), "HH:mm, dd/MM/yyyy", {
                      locale: vi,
                    })
                  : "Không rõ"}
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin */}
        <View className="p-5 space-y-2">
          <InfoRow label="Số CCCD" value={p.citizenId} />
          <InfoRow label="Họ tên" value={p.fullName} />
          <InfoRow
            label="Giới tính"
            value={
              p.gender === "Nam" ? "Nam" : p.gender === "Nữ" ? "Nữ" : p.gender
            }
          />
          <InfoRow
            label="Ngày sinh"
            value={p.dob ? format(new Date(p.dob), "dd/MM/yyyy") : null}
          />
          <InfoRow label="Quê quán" value={p.hometown} />
          <InfoRow label="Nơi thường trú" value={p.address} />
        </View>

        {/* Nút hành động */}
        <View className="flex-row px-5 pb-5 gap-3">
          <TouchableOpacity
            onPress={() =>
              handleAction(item.id, "approve", p.fullName || item.fullName)
            }
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
            onPress={() =>
              handleAction(item.id, "reject", p.fullName || item.fullName)
            }
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
    <View className="flex-1 bg-gray-50 pt-2">
      {/* 1. THANH TAB CHUYỂN ĐỔI */}
      <View className="flex-row items-center mx-4 bg-white rounded-xl p-1 mb-2 shadow-sm border border-gray-100">
        {/* Nút Quay về Home */}
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeAdminScreen")}
          className="px-3 py-2 rounded-lg bg-gray-200 mr-2"
        >
          <Text className="font-bold text-gray-700">Home</Text>
        </TouchableOpacity>

        {/* Thanh Tab */}
        <TouchableOpacity
          onPress={() => setActiveTab("pending")}
          className={`flex-1 py-2 rounded-lg items-center ${activeTab === "pending" ? "bg-blue-600" : "bg-transparent"}`}
        >
          <Text
            className={`font-bold ${activeTab === "pending" ? "text-white" : "text-gray-500"}`}
          >
            Duyệt CCCD
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("users")}
          className={`flex-1 py-2 rounded-lg items-center ${activeTab === "users" ? "bg-blue-600" : "bg-transparent"}`}
        >
          <Text
            className={`font-bold ${activeTab === "users" ? "text-white" : "text-gray-500"}`}
          >
            Danh sách User
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. NỘI DUNG CHÍNH */}
      {activeTab === "pending" ? (
        // --- GIỮ NGUYÊN CODE CŨ CỦA TAB CCCD ---
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem} // renderItem cũ của bạn
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchRequests} />
          }
          ListEmptyComponent={
            <Text className="text-center mt-10 text-gray-400">
              Không có yêu cầu duyệt
            </Text>
          }
        />
      ) : (
        // --- GIAO DIỆN TAB MỚI: DANH SÁCH USER ---
        <View className="flex-1">
          {/* Thanh tìm kiếm */}
          <View className="px-4 mb-2">
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-12">
              <TextInput
                className="flex-1 h-full"
                placeholder="Tìm tên, email, sđt..."
                value={searchQuery}
                onChangeText={setSearchQuery} // Cần debounce nếu muốn tối ưu
                onSubmitEditing={() => fetchUsers()}
              />
              <TouchableOpacity onPress={() => fetchUsers()}>
                <Text className="text-blue-600 font-bold">Tìm</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={() => {
              if (page < totalPages) fetchUsers(true);
            }}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleOpenDetail(item.id)}
                className="bg-white mx-4 mb-3 p-3 rounded-xl shadow-sm border border-gray-100 flex-row items-center"
              >
                <Image
                  source={
                    item.image
                      ? { uri: item.image }
                      : require("../../../assets/default.png")
                  }
                  className="w-12 h-12 rounded-full bg-gray-200"
                />

                <View className="ml-3 flex-1">
                  <Text className="font-bold text-gray-800">
                    {item.fullName}
                  </Text>
                  <Text className="text-xs text-gray-500">{item.email}</Text>
                  <Text className="text-xs text-gray-500">
                    {item.phone ? item.phone : "Chưa có SĐT"}
                  </Text>
                </View>
                <View className="items-end">
                  {item.is_cccd_verified ? (
                    <Text className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                      Đã xác thực
                    </Text>
                  ) : (
                    <Text className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                      Chưa xác thực
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* 3. MODAL CHI TIẾT USER */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white p-5">
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="self-end mb-4"
          >
            <Text className="text-blue-600 font-bold text-lg">Đóng</Text>
          </TouchableOpacity>

          {selectedUser ? (
            <View>
              <View className="items-center mb-6">
                <Image
                  source={
                    selectedUser.image
                      ? { uri: selectedUser.image }
                      : require("../../../assets/default.png")
                  }
                  className="w-24 h-24 rounded-full mb-2 bg-gray-200"
                />

                <Text className="text-xl font-bold">
                  {selectedUser.fullName}
                </Text>
                <Text className="text-gray-500">{selectedUser.email}</Text>
              </View>

              <Text className="font-bold text-lg mb-2 border-b border-gray-200 pb-1">
                Thông tin cá nhân
              </Text>
              <InfoRow
                label="SĐT"
                value={selectedUser.phone || "Chưa cập nhật"}
              />
              <InfoRow
                label="CCCD"
                value={selectedUser.citizenId || "Chưa có"}
              />
              <InfoRow
                label="Ngày tạo"
                value={format(new Date(selectedUser.createdAt), "dd/MM/yyyy")}
              />

              <Text className="font-bold text-lg mt-6 mb-2 border-b border-gray-200 pb-1">
                Thống kê
              </Text>
              <InfoRow
                label="Số bài đăng"
                value={`${selectedUser.products?.length || 0} tin`}
              />
              <InfoRow
                label="Trạng thái"
                value={
                  selectedUser.is_cccd_verified
                    ? "Đã xác thực"
                    : "Chưa xác thực"
                }
              />

              <TouchableOpacity
                onPress={() =>
                  handleDeleteUser(selectedUser.id, selectedUser.fullName)
                }
                className="mt-10 bg-red-50 border border-red-200 p-4 rounded-xl flex-row justify-center items-center"
              >
                <Ionicons name="trash-outline" size={24} color="#dc2626" />
                <Text className="text-red-600 font-bold text-lg ml-2">
                  Xóa tài khoản vĩnh viễn
                </Text>
              </TouchableOpacity>

              <Text className="text-center text-gray-400 text-xs mt-2">
                Hành động này không thể hoàn tác
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="blue" />
          )}
        </View>
      </Modal>
    </View>
  );
}

// Component nhỏ để hiển thị dòng thông tin
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;
  return (
    <View className="flex-row">
      <Text className="text-gray-600 font-medium w-32">{label}:</Text>
      <Text className="text-gray-900 flex-1 font-medium">{value}</Text>
    </View>
  );
};
