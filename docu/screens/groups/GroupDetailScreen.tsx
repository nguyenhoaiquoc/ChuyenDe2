import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Switch,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type GroupDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "GroupDetailScreen"
>;

export default function GroupDetailScreen({
  navigation,
  route,
}: GroupDetailScreenProps) {
  const { group } = route.params;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isApprovalEnabled, setIsApprovalEnabled] = useState(
    group.mustApprovePosts || false
  );
  const [role, setRole] = useState<"leader" | "member" | "none" | null>(null);
  const [joinStatus, setJoinStatus] = useState<"none" | "pending" | "joined">(
    "none"
  );

  const isMember = role === "leader" || role === "member";
  const isLeader = role === "leader";

  const fetchData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const [productsRes, roleRes, statusRes] = await Promise.all([
        axios.get(`${path}/groups/${group.id}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${path}/groups/${group.id}/role`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${path}/groups/${group.id}/join-status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProducts(productsRes.data);

      const r = roleRes.data.role;
      setRole(r === "leader" || r === "member" || r === "none" ? r : "none");

      const s = statusRes.data.status;
      setJoinStatus(
        s === "none" || s === "pending" || s === "joined" ? s : "none"
      );
    } catch (err) {
      console.log("Lỗi khi tải dữ liệu nhóm:", err);
      setRole("none");
      setJoinStatus("none");
    }
  }, [group?.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleJoinGroup = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await axios.post(
        `${path}/groups/${group.id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", res.data.message);

      // Cập nhật trạng thái dựa trên response
      if (res.data.joinStatus === "joined") {
        setJoinStatus("joined");
        setRole("member");
      } else if (res.data.joinStatus === "pending") {
        setJoinStatus("pending");
      }

      await fetchData();
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể tham gia nhóm"
      );
    }
  };

  const handleCancelRequest = async () => {
    Alert.alert("Xác nhận hủy", "Bạn có chắc chắn muốn hủy yêu cầu tham gia?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy yêu cầu",
        style: "destructive",
        onPress: async () => {
          const token = await AsyncStorage.getItem("token");
          try {
            await axios.delete(`${path}/groups/${group.id}/join-request`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Đã hủy", "Yêu cầu tham gia đã được hủy");
            setJoinStatus("none");
            await fetchData();
          } catch (error: any) {
            Alert.alert(
              "Lỗi",
              error.response?.data?.message || "Không thể hủy"
            );
          }
        },
      },
    ]);
  };

  const handleCreatePost = () => {
    navigation.navigate("PostGroupFormScreen", {
      group,
      onPostSuccess: async () => {
        await fetchData();
      },
    });
  };

  const handleLeaveGroup = async () => {
    if (isLeader) {
      Alert.alert(
        "Không thể rời nhóm",
        "Bạn là trưởng nhóm. Vui lòng chuyển quyền trước khi rời nhóm.",
        [{ text: "Đã hiểu" }]
      );
      setMenuVisible(false);
      return;
    }

    Alert.alert(
      "Xác nhận rời nhóm",
      "Bạn có chắc chắn muốn rời khỏi nhóm này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Rời nhóm",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(`${path}/groups/${group.id}/leave`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert("Thành công", "Bạn đã rời nhóm");
              setRole("none");
              setJoinStatus("none");
              setMenuVisible(false);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể rời nhóm"
              );
            }
          },
        },
      ]
    );
  };

  const userMenuItems = [
    {
      name: "Quản lí nội dung của bạn",
      icon: "file-text",
      action: () => {
        setMenuVisible(false);
        navigation.navigate("MyGroupPostsScreen", { groupId: group.id });
      },
    },
    {
      name: "Rời nhóm",
      icon: "log-out",
      action: handleLeaveGroup,
      isDestructive: true,
    },
  ];

  const leaderMenuItems = [
    {
      name: "Sửa thông tin nhóm",
      icon: "edit",
      action: () => {
        setMenuVisible(false);
        navigation.navigate("EditGroupScreen", { group });
      },
    },
    {
      name: "Duyệt bài viết",
      icon: "check-square",
      action: () => {
        setMenuVisible(false);
        navigation.navigate("ApprovePostsScreen", { groupId: group.id });
      },
    },
    {
      name: "Xem thành viên",
      icon: "users",
      action: () => {
        setMenuVisible(false);
        navigation.navigate("GroupMembersScreen", {
          groupId: group.id,
          isLeader: true,
        });
      },
    },
    {
      name: "Xoá nhóm",
      icon: "trash-2",
      action: () => {
        setMenuVisible(false);
        Alert.alert("Xác nhận xóa nhóm", "Hành động này không thể hoàn tác.", [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xóa nhóm",
            style: "destructive",
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem("token");
                await axios.delete(`${path}/groups/${group.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                Alert.alert("Thành công", "Đã xóa nhóm");
                navigation.goBack();
              } catch (err) {
                Alert.alert("Lỗi", "Không thể xóa nhóm");
              }
            },
          },
        ]);
      },
      isDestructive: true,
    },
  ];

  const menuItems = isLeader
    ? [...leaderMenuItems, ...userMenuItems]
    : userMenuItems;

  const renderStatusBadge = () => {
    if (joinStatus === "pending") {
      return (
        <View className="mt-2 bg-yellow-500/80 px-3 py-1 rounded-full self-start">
          <Text className="text-white text-xs font-semibold">
            Chờ phê duyệt
          </Text>
        </View>
      );
    }
    if (isLeader) {
      return (
        <View className="mt-2 bg-green-500/80 px-3 py-1 rounded-full self-start">
          <Text className="text-white text-xs font-semibold">Trưởng nhóm</Text>
        </View>
      );
    }
    if (role === "member") {
      return (
        <View className="mt-2 bg-blue-500/80 px-3 py-1 rounded-full self-start">
          <Text className="text-white text-xs font-semibold">Thành viên</Text>
        </View>
      );
    }
    return null;
  };

  const renderActionButton = () => {
    if (joinStatus === "none") {
      return (
        <TouchableOpacity
          onPress={handleJoinGroup}
          className="bg-blue-600 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">
            {group.isPublic ? "Tham gia nhóm" : "Gửi yêu cầu"}
          </Text>
        </TouchableOpacity>
      );
    }

    if (joinStatus === "pending") {
      return (
        <TouchableOpacity
          onPress={handleCancelRequest}
          className="bg-red-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">Hủy yêu cầu</Text>
        </TouchableOpacity>
      );
    }

    if (joinStatus === "joined") {
      return (
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity
            onPress={handleCreatePost}
            className="bg-white/70 p-2 rounded-full w-10 h-10 items-center justify-center"
          >
            <Feather name="edit" size={20} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="bg-white/70 p-2 rounded-full w-10 h-10 items-center justify-center"
          >
            <Feather name="more-vertical" size={20} color="black" />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderHeader = () => (
    <ImageBackground
      source={
        group.image ? { uri: group.image } : require("../../assets/khi.png")
      }
      className="h-52 w-full mb-4"
    >
      <View className="flex-1 justify-between p-4 bg-black/40">
        <View className="flex-row justify-between items-center mt-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/70 p-2 rounded-full w-10 h-10 items-center justify-center"
          >
            <Feather name="arrow-left" size={20} color="#000" />
          </TouchableOpacity>

          {renderActionButton()}
        </View>

        <View>
          <Text className="text-white text-2xl font-bold">{group.name}</Text>
          <View className="flex-row items-center mt-1">
            <Feather name="users" size={14} color="white" />
          
          </View>
          <View className="flex-row items-center mt-1">
            <Feather
              name={group.isPublic ? "globe" : "lock"}
              size={12}
              color="#E5E7EB"
            />
            <Text className="text-xs text-gray-200 ml-1">
              {group.isPublic ? "Nhóm Công khai" : "Nhóm Riêng tư"}
            </Text>
          </View>
          {renderStatusBadge()}
        </View>
      </View>
    </ImageBackground>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Đang tải dữ liệu nhóm...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} className="bg-gray-100">
      <FlatList
        data={products}
        keyExtractor={(item: any) => String(item.id)}
        numColumns={1}
        ListHeaderComponent={
          <>
            {renderHeader()}
            <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800">
                Các bài viết nhóm
              </Text>
            </View>
          </>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        renderItem={({ item }) => {
          const imageUrl =
            item.thumbnail_url ||
            (item.images?.length > 0 ? item.images[0].image_url : null);

          const priceFormat =
            item.price === 0
              ? "Miễn phí"
              : item.price == null
                ? "Trao đổi"
                : `${item.price.toLocaleString()} đ`;

          return (
            <View className="mb-8 p-3 bg-white rounded-xl shadow-md">
              <View className="flex-row items-center mb-3">
                <Image
                  source={
                    item.user?.avatar
                      ? { uri: item.user.avatar }
                      : require("../../assets/khi.png")
                  }
                  className="w-10 h-10 rounded-full border border-gray-300"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 font-semibold">
                    {item.user?.name || "Người dùng"}
                  </Text>
                  <TouchableOpacity
                    className={`mb-1.5 px-2 py-1 rounded-full self-start ${
                      item?.postType?.name === "Đăng bán"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  >
                    <Text className="text-[10px] text-white font-semibold">
                      {item?.postType?.name || "Không rõ"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-red-400 font-semibold text-lg mt-2 pr-5">
                  {priceFormat}
                </Text>
              </View>

              <Text className="font-bold text-base text-gray-900 mb-2">
                {item.name}
              </Text>

              {item.location && (
                <View className="flex-row items-center my-2">
                  <Feather name="map-pin" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    {item.location}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => {
                  if (joinStatus !== "joined") {
                    Alert.alert(
                      "Thông báo",
                      joinStatus === "pending"
                        ? "Yêu cầu tham gia của bạn đang chờ phê duyệt."
                        : "Bạn cần tham gia nhóm để xem chi tiết bài viết."
                    );
                    return;
                  }
                  navigation.navigate("ProductDetail", { product: item });
                }}
              >
                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-full aspect-[4/3] rounded-lg border border-gray-200 bg-gray-100"
                    resizeMode="cover"
                  />
                )}
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-10 px-4">
            <Feather name="package" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              Chưa có bài viết nào trong nhóm này.
            </Text>
            {joinStatus === "joined" && (
              <TouchableOpacity
                onPress={handleCreatePost}
                className="mt-4 bg-blue-600 px-6 py-2 rounded-full"
              >
                <Text className="text-white font-semibold">
                  Đăng bài viết đầu tiên
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {joinStatus === "joined" && (
        <Modal
          visible={isMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View className="flex-1 bg-black/50">
              <View className="absolute top-16 right-4 bg-white rounded-lg shadow-xl w-72 overflow-hidden">
                <View className="p-3 border-b border-gray-100">
                  <Text className="text-xs font-semibold text-gray-400 uppercase">
                    Tùy chọn
                  </Text>
                </View>

                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.name}
                    onPress={item.action}
                    className={`flex-row items-center p-3 ${
                      item.isDestructive ? "border-t border-gray-100" : ""
                    } ${index > 0 ? "border-t border-gray-50" : ""}`}
                  >
                    <Feather
                      name={item.icon as any}
                      size={20}
                      color={item.isDestructive ? "#E53E3E" : "#333"}
                    />
                    <Text
                      className={`ml-3 text-base flex-1 ${
                        item.isDestructive ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}

                {isLeader && group.isPublic && (
                  <View className="flex-row items-center justify-between p-3 border-t border-gray-100">
                    <View className="flex-row items-center flex-1 pr-2">
                      <Feather name="check-circle" size={20} color="#333" />
                      <Text className="ml-3 text-base text-gray-800">
                        Duyệt bài viết
                      </Text>
                    </View>
                    <Switch
                      trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                      thumbColor={"#f4f3f4"}
                      onValueChange={async (v) => {
                        if (!v) {
                          Alert.alert(
                            "Nếu tắt, bài viết sẽ được đăng tự động."
                          );
                        }
                        setIsApprovalEnabled(v);
                        try {
                          const token = await AsyncStorage.getItem("token");
                          await axios.patch(
                            `${path}/groups/${group.id}`,
                            { mustApprovePosts: v },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                        } catch (err) {
                          setIsApprovalEnabled(!v);
                        }
                      }}
                      value={isApprovalEnabled}
                    />
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  );
}
