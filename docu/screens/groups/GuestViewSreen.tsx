import axios from "axios";
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { path } from "../../config";
import { GroupType } from "../../types";

export default function GuestViewSreen({ onLogin }: { onLogin?: () => void }) {
  const [highlightedGroups, setHighlightedGroups] = useState<GroupType[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // const res = await axios.get(`${path}/groups/featured`);
        // setHighlightedGroups(res.data);
      } catch (err) {
        console.error(" Lỗi lấy nhóm nổi bật:", err);
      }
    };
    fetchGroups();
  }, []);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-5">
        {/* Tiêu đề */}
        <Text className="text-2xl font-bold mb-3">Khám phá cộng đồng</Text>
        <Text className="text-gray-600 text-base mb-5">
          Tham gia các nhóm thú vị để kết nối, học hỏi và chia sẻ cùng mọi
          người!
        </Text>

        {/* Nhóm nổi bật */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Nhóm nổi bật</Text>
          {highlightedGroups.map((group) => (
            <View key={group.id} className="flex-row items-center mb-4">
              <Image
                source={
                  group.image
                    ? { uri: group.image }
                    : require("../../assets/defaultgroup.png")
                }
                className="w-14 h-14 rounded-full"
              />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-sm">{group.name}</Text>
                <Text className="text-xs text-gray-500">
                  {group.memberCount} ·{" "}
                  {group.isPublic ? "Nhóm Công khai" : "Nhóm Riêng tư"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Lợi ích khi tham gia */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">
            Vì sao nên tham gia nhóm?
          </Text>
          <View className="flex-row items-center mb-2">
            <Text className="ml-3 text-gray-700">
              Kết nối với người có cùng sở thích
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Text className="ml-3 text-gray-700">
              Chia sẻ kiến thức và tài liệu
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Text className="ml-3 text-gray-700">
              Hỏi đáp nhanh, nhận phản hồi từ cộng đồng
            </Text>
          </View>
        </View>

        {/* Nút đăng nhập */}
        <TouchableOpacity
          onPress={onLogin}
          className="bg-blue-500 py-3 rounded-lg"
        >
          <Text className="text-white text-center font-bold text-base">
            Đăng nhập để bắt đầu
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
