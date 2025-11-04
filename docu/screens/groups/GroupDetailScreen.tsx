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

  const isMember = role === "leader" || role === "member";
  const isLeader = role === "leader";
  const isGroupPublic = group.isPublic || true;

  // 🔹 Fetch dữ liệu nhóm + role
  const fetchData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      // 1️⃣ Lấy danh sách sản phẩm trong nhóm
      const res = await axios.get(`${path}/groups/${group.id}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);

      // 2️⃣ Kiểm tra role của user trong nhóm
      const roleRes = await axios.get(`${path}/groups/${group.id}/role`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const r = roleRes.data.role;
      // console.log("User role:", r);
      if (r === "leader" || r === "member" || r === "none") {
        setRole(r);
      } else {
        setRole("none");
      }
    } catch (err) {
      console.log("Lỗi khi tải dữ liệu nhóm:", err);
      setRole("none");
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

  // 🔹 Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // ✅ Hàm đăng bài với callback
  const handleCreatePost = () => {
    navigation.navigate("PostGroupFormScreen", {
      group,
      onPostSuccess: async () => {
        console.log("✅ Đăng bài thành công! Đang reload...");
        await fetchData(); // Reload lại danh sách sản phẩm
      },
    });
  };

  // 🔹 Tham gia nhóm
  const handleJoinGroup = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${path}/groups/${group.id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Thành công", "Bạn đã tham gia nhóm");
      setRole("member");
      await fetchData();
    } catch (error: any) {
      console.log("Lỗi tham gia nhóm:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Không thể tham gia nhóm, vui lòng thử lại.";
      Alert.alert("Lỗi", errorMsg);
    }
  };

  // 🔹 Rời nhóm
  const handleLeaveGroup = async () => {
    if (isLeader) {
      Alert.alert(
        "Không thể rời nhóm",
        "Bạn là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm cho thành viên khác trước khi rời nhóm.",
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
              setMenuVisible(false);
              navigation.goBack();
              await fetchData();
            } catch (error: any) {
              console.log("Lỗi rời nhóm:", error);
              const errorMsg =
                error.response?.data?.message ||
                "Không thể rời nhóm, vui lòng thử lại.";
              Alert.alert("Lỗi", errorMsg);
            }
          },
        },
      ]
    );
  };

  // 🔹 Menu cơ bản cho member
  const userMenuItems = [
    {
      name: "Quản lí nội dung của bạn",
      icon: "file-text",
      action: () => {
        setMenuVisible(false);
        console.log("Xem bài viết của tôi");
      },
    },
    {
      name: "Rời nhóm",
      icon: "log-out",
      action: handleLeaveGroup,
      isDestructive: true,
    },
  ];

  // 🔹 Menu riêng cho leader
  const leaderMenuItems = [
    {
      name: "Sửa thông tin nhóm",
      icon: "edit",
      action: () => {
        setMenuVisible(false);
        console.log("Sửa nhóm");
      },
    },
    {
      name: "Duyệt bài viết",
      icon: "check-square",
      action: () => {
        setMenuVisible(false);
        console.log("Duyệt bài viết");
      },
    },
    {
      name: "Duyệt thành viên",
      icon: "user-check",
      action: () => {
        setMenuVisible(false);
        console.log("Duyệt thành viên");
      },
    },
    {
      name: "Xem thành viên",
      icon: "users",
      action: () => {
        setMenuVisible(false);
        console.log("Xem thành viên");
      },
    },
    {
      name: "Chuyển quyền trưởng nhóm",
      icon: "shield",
      action: () => {
        setMenuVisible(false);
        console.log("Chuyển quyền trưởng nhóm");
      },
    },
    {
      name: "Xoá nhóm",
      icon: "trash-2",
      action: () => {
        setMenuVisible(false);
        Alert.alert(
          "Xác nhận xóa nhóm",
          "Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác.",
          [
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
                  Alert.alert("✅ Đã xóa nhóm");
                  navigation.goBack();
                } catch (err) {
                  console.log("❌ Lỗi xóa nhóm:", err);
                  Alert.alert("Lỗi", "Không thể xóa nhóm");
                }
              },
            },
          ]
        );
      },
      isDestructive: true,
    },
  ];

  const menuItems = isLeader
    ? [...leaderMenuItems, ...userMenuItems]
    : userMenuItems;

  // 🔹 Header hiển thị ảnh & nút menu
  const renderHeader = () => (
    <ImageBackground
      source={
        group.image ? { uri: group.image } : require("../../assets/khi.png")
      }
      className="h-52 w-full mb-4"
    >
      <View className="flex-1 justify-between p-4 bg-black/40">
        {/* Thanh top */}
        <View className="flex-row justify-between items-center mt-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/70 p-2 rounded-full w-10 h-10 items-center justify-center"
          >
            <Feather name="arrow-left" size={20} color="#000" />
          </TouchableOpacity>

          {/* Nếu là thành viên → có nút đăng bài + menu, nếu chưa → nút tham gia */}
          {isMember ? (
            <View className="flex-row items-center space-x-3">
              {/* ✅ NÚT ĐĂNG BÀI - LUÔN HIỂN THỊ */}
              <TouchableOpacity
                onPress={handleCreatePost}
                className="bg-white/70 p-2 rounded-full w-10 h-10 items-center justify-center mr-2"
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
          ) : (
            <TouchableOpacity
              onPress={handleJoinGroup}
              className="bg-blue-600 px-4 py-2 rounded-full"
            >
              <Text className="text-white font-semibold">Tham gia nhóm</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Thông tin nhóm */}
        <View>
          <Text className="text-white text-2xl font-bold">{group.name}</Text>
          <View className="flex-row items-center mt-1">
            <Feather name="users" size={14} color="white" />
            <Text className="text-white text-sm ml-1">
              {group.memberCount} thành viên
            </Text>
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
          {isLeader && (
            <View className="mt-2 bg-green-500/80 px-3 py-1 rounded-full self-start">
              <Text className="text-white text-xs font-semibold">
                Trưởng nhóm
              </Text>
            </View>
          )}
          {role === "member" && (
            <View className="mt-2 bg-blue-500/80 px-3 py-1 rounded-full self-start">
              <Text className="text-white text-xs font-semibold">
                Thành viên
              </Text>
            </View>
          )}
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
        numColumns={1} // ✅ chỉ 1 sản phẩm mỗi hàng
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
          // ✅ Lấy ảnh sản phẩm
          const imageUrl =
            item.thumbnail_url ||
            (item.images?.length > 0 ? item.images[0].image_url : null) ||
            "Không có hình";
          console.log(item);

          const priceFormat =
            item.price === 0
              ? "Miễn phí"
              : item.price == null
                ? "Trao đổi"
                : item.price;

          return (
            <View className="mb-8 p-3 bg-white rounded-xl shadow-md">
              {/* 🧑‍💼 Thông tin người đăng */}
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

                {/* 💰 Giá sản phẩm */}
                <Text className="text-red-400 font-semibold text-lg mt-2 pr-5">
                  {priceFormat}
                </Text>
              </View>

              {/* 🏷️ Tên sản phẩm */}
              <Text className="font-bold text-base text-gray-900 mb-2">
                {item.name}
              </Text>

              {/* 📍 Địa chỉ */}
              {item.location && (
                <View className="flex-row items-center my-2">
                  <Feather name="map-pin" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    {item.location}
                  </Text>
                </View>
              )}

              {/* 🖼️ Hình ảnh sản phẩm */}
              <TouchableOpacity
                onPress={() => {
                  if (!isMember && group.isPublic) {
                    Alert.alert(
                      "Thông báo",
                      "Bạn cần tham gia nhóm để xem chi tiết bài viết."
                    );
                    return;
                  }

                  navigation.navigate("ProductDetail", { product: item });
                }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  className="w-full aspect-[4/3] rounded-lg border border-gray-200 bg-gray-100"
                  resizeMode="cover"
                />
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

      {/* Menu (giữ nguyên phần này) */}
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
                    onPress={() => {
                      item.action();
                    }}
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

                {isLeader && isGroupPublic && (
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
                            "Cảnh báo",
                            "Nếu có những bài viết vi phạm, sẽ bị xóa!",
                            [{ text: "Đã hiểu" }]
                          );
                        }
                        setIsApprovalEnabled(v);
                        // Gọi API update group.mustApprovePosts
                        await axios.patch(`${path}/groups/${group.id}`, {
                          mustApprovePosts: v,
                        });
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
