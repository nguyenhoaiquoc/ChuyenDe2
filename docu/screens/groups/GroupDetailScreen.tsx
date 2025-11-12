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
  const { groupId } = route.params;

  const [groupDetail, setGroupDetail] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isApprovalEnabled, setIsApprovalEnabled] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const role = groupDetail?.userRole || "none";
  const isLeader = role === "leader";
  const isMember = groupDetail?.isMember || false;

  const fetchData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const [detailRes, productsRes] = await Promise.all([
        axios.get(`${path}/groups/${groupId}/detail`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${path}/groups/${groupId}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setGroupDetail(detailRes.data);
      setProducts(productsRes.data);
      setIsApprovalEnabled(detailRes.data.mustApprovePosts || false);
    } catch (err: any) {
      console.log("Lỗi khi tải dữ liệu nhóm:", err);
    }
  }, [groupId]);

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
    if (isJoining) return; // Ngăn chặn double-click
    setIsJoining(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập để thực hiện hành động này.");
        return;
      }

      const res = await axios.post(
        `${path}/groups/${groupId}/join`,
        {}, // Không cần body, chỉ cần token
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Sau khi gửi yêu cầu, tải lại dữ liệu để cập nhật trạng thái
      // (ví dụ: isMember có thể thành true nếu nhóm public,
      // hoặc server có thể trả về trạng thái 'pending' mà bạn cần xử lý)
      await fetchData();

      Alert.alert(
        "Thành công",
        res.data?.message || "Yêu cầu tham gia đã được gửi."
      );
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể gửi yêu cầu tham gia"
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreatePost = () => {
    navigation.navigate("PostGroupFormScreen", {
      group: groupDetail,
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
              await axios.delete(`${path}/groups/${groupId}/leave`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert("Thành công", "Bạn đã rời nhóm");
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
        navigation.navigate("MyGroupPostsScreen", { groupId });
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
        navigation.navigate("EditGroupScreen", { group: groupDetail });
      },
    },
    {
      name: "Duyệt bài viết",
      icon: "check-square",
      action: () => {
        setMenuVisible(false);
        navigation.navigate("ApprovePostsScreen", { groupId });
      },
    },
    {
      name: "Xem thành viên",
      icon: "users",
      action: () => {
        setMenuVisible(false);
        navigation.navigate("GroupMembersScreen", {
          groupId,
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
                await axios.delete(`${path}/groups/${groupId}`, {
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
    if (isLeader) {
      return (
        <View className="mt-2 bg-green-500/80 px-3 py-1 rounded-full self-start">
          <Text className="text-white text-xs font-semibold">Trưởng nhóm</Text>
        </View>
      );
    }
    if (isMember) {
      return (
        <View className="mt-2 bg-blue-500/80 px-3 py-1 rounded-full self-start">
          <Text className="text-white text-xs font-semibold">Thành viên</Text>
        </View>
      );
    }
    return null;
  };

  // ...
  const renderActionButton = () => {
    if (isMember) {
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

    return (
      <TouchableOpacity
        onPress={handleJoinGroup}
        disabled={isJoining}
        className={`px-4 py-2 rounded-full flex-row items-center ${
          isJoining ? "bg-gray-500/90" : "bg-blue-600/90"
        }`}
      >
        {isJoining ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-white font-semibold ml-2">
            {isJoining ? "Đang xử lý..." : "Gửi yêu cầu"}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <ImageBackground
      source={
        groupDetail?.image
          ? { uri: groupDetail.image }
          : require("../../assets/khi.png")
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
          <Text className="text-white text-2xl font-bold">
            {groupDetail?.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Feather name="users" size={14} color="white" />
            <Text className="text-white text-sm ml-1">
              {groupDetail?.memberCount} thành viên
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Feather name="lock" size={12} color="#E5E7EB" />
            <Text className="text-xs text-gray-200 ml-1">Nhóm Riêng tư</Text>
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
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProductDetail", { product: item })
              }
              className="mb-8 p-3 bg-white rounded-xl shadow-md"
            >
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

              {imageUrl && (
                <Image
                  source={{ uri: imageUrl }}
                  className="w-full aspect-[4/3] rounded-lg border border-gray-200 bg-gray-100"
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-10 px-4">
            <Feather name="package" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              Chưa có bài viết nào trong nhóm này.
            </Text>
            {isMember && (
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

      {isMember && (
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

                {isLeader && (
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
                        setIsApprovalEnabled(v);
                        try {
                          const token = await AsyncStorage.getItem("token");
                          await axios.patch(
                            `${path}/groups/${groupId}/post-approval`,
                            { mustApprovePosts: v },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          Alert.alert(
                            "Thành công",
                            v
                              ? "Đã bật chế độ duyệt bài viết"
                              : "Đã tắt chế độ duyệt bài viết"
                          );
                        } catch (err) {
                          setIsApprovalEnabled(!v);
                          Alert.alert("Lỗi", "Không thể cập nhật cài đặt");
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
