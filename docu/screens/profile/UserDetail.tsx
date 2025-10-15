import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import { path } from "../../config";

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
};

interface MenuItem {
  id: number;
  label: string;
}

export default function UserProfile({ navigation }: any) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  // Danh sách lý do báo cáo
  const menuItems: MenuItem[] = [
    { id: 1, label: "Hình đại diện sản phẩm" },
    { id: 2, label: "Thông tin cá nhân sai phạm" },
    { id: 3, label: "Người bán có dấu hiệu lừa đảo" },
    { id: 4, label: "Lý do khác" },
  ];

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 🛰 Gửi báo cáo thật hoặc giả
  const handleSubmitReport = async () => {
    if (selectedIds.length === 0) return;

    const data = {
      product_id: 12, //  thay ID thật khi có
      reporter_id: 3, //  thay ID người dùng hiện tại
      reason: selectedIds
        .map((id) => menuItems.find((m) => m.id === id)?.label)
        .join(", "),
      created_at: new Date().toISOString(),
    };

    console.log(" Dữ liệu gửi:", data);

    try {
      // Gọi API thật — chỉnh lại IP máy bạn
      const res = await axios.post(`${path}/reports`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201 || res.status === 200) {
        Alert.alert(" Thành công", "Báo cáo đã được gửi!");
      } else {
        Alert.alert(" Lỗi", "Máy chủ phản hồi không hợp lệ.");
      }
    } catch (error: any) {
      console.log(" Lỗi gửi báo cáo:", error.response?.data || error.message);
      Alert.alert(
        "Lỗi",
        "Không thể gửi báo cáo. Kiểm tra lại mạng hoặc server backend."
      );
    }

    setReportVisible(false);
    setSelectedIds([]); // reset lại
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync("https://imsport.vn/user/congcong");
    setMenuVisible(false);
    Alert.alert("Đã sao chép", "Liên kết hồ sơ đã được sao chép.");
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="w-full h-36 bg-gray-100">
        <Image
          source={require("../../assets/hoa.png")}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>

      {/* Avatar */}
      <View className="items-center -mt-10">
        <Image
          source={require("../../assets/hoa.png")}
          className="w-24 h-24 rounded-full border-4 border-white"
        />
      </View>

      <FontAwesome5
        name="arrow-left"
        size={20}
        color="#000"
        className="absolute top-10 left-5"
        onPress={() => navigation.goBack()}
      />

      {/* Info */}
      <View className="items-center mt-3"></View>
      <View className="flex-row items-center justify-between px-5 mt-4">
        <View className="items-center">
          <View className="items-start self-start mt-2 ">
            <Text className="text-lg font-semibold">hello</Text>
            <Text className="text-gray-500 text-sm mt-1">Chưa có đánh giá</Text>
            <Text className="text-gray-500 text-sm mt-1">
              Người theo dõi:{" "}
              <Text className="text-black font-semibold">16</Text>
            </Text>
          </View>
        </View>

        {/* Nút hành động */}
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="bg-gray-100 w-10 h-10 rounded-lg items-center justify-center"
          >
            <MaterialIcons name="more-horiz" size={22} color="black" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-orange-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-medium">+ Theo dõi</Text>
          </TouchableOpacity>

          {/* Modal báo cáo */}
          <Modal
            visible={reportVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setReportVisible(false)}
          >
            <Pressable
              className="flex-1 bg-black/40 justify-center items-center"
              onPress={() => setReportVisible(false)}
            >
              <Pressable
                onPress={(e) => e.stopPropagation()}
                className="bg-white w-80 rounded-2xl p-4"
              >
                <Text className="text-base font-semibold text-center mb-3">
                  Người bán này có vấn đề gì?
                </Text>

                {menuItems.map((itemmenu) => (
                  <TouchableOpacity
                    key={itemmenu.id}
                    onPress={() => handleToggleSelect(itemmenu.id)}
                    className={`py-2 border-b border-gray-200 rounded-md ${
                      selectedIds.includes(itemmenu.id) ? "bg-gray-200" : ""
                    }`}
                  >
                    <Text
                      className={`text-center ${
                        selectedIds.includes(itemmenu.id)
                          ? "text-black font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {itemmenu.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Nút gửi báo cáo */}
                <TouchableOpacity
                  onPress={handleSubmitReport}
                  disabled={selectedIds.length === 0}
                  className={`mt-4 py-3 rounded-xl ${
                    selectedIds.length === 0
                      ? "bg-gray-300"
                      : "bg-red-500 active:bg-red-600"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedIds.length === 0
                        ? "text-gray-500"
                        : "text-white"
                    }`}
                  >
                    Gửi báo cáo
                  </Text>
                </TouchableOpacity>

                {/* Nút hủy */}
                <TouchableOpacity
                  onPress={() => setReportVisible(false)}
                  className="mt-3 py-2 rounded-xl bg-gray-100"
                >
                  <Text className="text-center text-gray-700 font-medium">
                    Hủy
                  </Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </View>

      {/* Menu popup chính */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setMenuVisible(false)}
        >
          <View className="bg-white w-64 rounded-2xl shadow-lg">
            <TouchableOpacity
              onPress={handleCopyLink}
              className="px-5 py-4 border-b border-gray-100"
            >
              <Text className="text-gray-700">Nhắn tin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                setReportVisible(true);
              }}
              className="px-5 py-4"
            >
              <Text className="text-red-500">Báo cáo vi phạm</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Thông tin thêm */}
      <View className="px-5 mt-6 space-y-3">
        <View className="flex-row items-center">
          <Ionicons name="chatbubbles-outline" size={18} color="gray" />
          <Text className="text-gray-700 text-base ml-2">Phản hồi chat:</Text>
          <Text className="text-gray-500 text-base ml-1">
            Thỉnh thoảng (Phản hồi chậm)
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={18} color="gray" />
          <Text className="text-gray-700 text-base ml-2">Đã tham gia:</Text>
          <Text className="text-gray-500 text-base ml-1">1 năm 4 tháng</Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={18} color="gray" />
          <Text className="text-gray-700 text-base ml-2">Địa chỉ:</Text>
          <Text
            className="text-gray-500 text-base ml-1 flex-shrink"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Thành phố Cao Lãnh, Đồng Tháp
          </Text>
        </View>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
}
