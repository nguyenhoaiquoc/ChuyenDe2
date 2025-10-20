import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

export default function CreateGroupScreen() {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState("");
  const [privacy, setPrivacy] = useState("public"); // 'public' hoặc 'private'

  const handleCreateGroup = () => {
    // Logic xử lý tạo nhóm sẽ ở đây
    // 1. Kiểm tra dữ liệu (tên nhóm không được rỗng)
    if (!groupName.trim()) {
      alert("Vui lòng nhập tên nhóm.");
      return;
    }

    // 2. Gọi API để tạo nhóm với groupName và privacy
    console.log("Đang tạo nhóm:", { name: groupName, privacy: privacy });

    // 3. Sau khi tạo thành công, quay lại màn hình trước
    // navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4">Tạo nhóm mới</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="p-4">
          {/* Tên nhóm */}
          <View>
            <Text className="text-base font-medium mb-2">Tên nhóm</Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Ví dụ: Hội yêu thú cưng Sài Gòn"
              className="border border-gray-300 rounded-lg p-3 text-base"
            />
          </View>

          {/* Quyền riêng tư */}
          <View className="mt-6">
            <Text className="text-base font-medium mb-3">Quyền riêng tư</Text>

            {/* Lựa chọn Công khai */}
            <TouchableOpacity
              onPress={() => setPrivacy("public")}
              className="flex-row items-center p-3 border border-gray-300 rounded-lg"
            >
              <Feather
                name={privacy === "public" ? "check-circle" : "circle"}
                size={24}
                color={privacy === "public" ? "#3b82f6" : "gray"}
              />
              <View className="ml-3">
                <Text className="text-base font-semibold">Công khai</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Mọi người đều có thể thấy và tham gia nhóm.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Lựa chọn Riêng tư */}
            <TouchableOpacity
              onPress={() => setPrivacy("private")}
              className="flex-row items-center p-3 border border-gray-300 rounded-lg mt-3"
            >
              <Feather
                name={privacy === "private" ? "check-circle" : "circle"}
                size={24}
                color={privacy === "private" ? "#3b82f6" : "gray"}
              />
              <View className="ml-3">
                <Text className="text-base font-semibold">Riêng tư</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Chỉ thành viên mới có thể thấy bài viết và tham gia.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Nút Tạo nhóm */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleCreateGroup}
          className="bg-blue-500 rounded-lg p-4"
        >
          <Text className="text-white text-center font-bold text-base">
            Tạo nhóm
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
