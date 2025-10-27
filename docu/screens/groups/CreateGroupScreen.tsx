import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { path } from "../../config";

export default function CreateGroupScreen() {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [images, setImages] = useState<string[]>([]);

  const handleUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);
      setImages(selected);
    }
  };

  const removeImage = () => setImages([]);

  const uploadGroupImage = async (uri: string) => {
    const data = new FormData();
    const filename = uri.split("/").pop();
    const ext = filename?.split(".").pop();
    const type = ext ? `image/${ext}` : "image";

    data.append("file", {
      uri,
      name: filename || "photo.jpg",
      type,
    } as any);

    const res = await fetch(`${path}/groups/upload-image`, {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      body: data,
    });

    const result = await res.json();
    return result.url; // ✅ đường dẫn Cloudinary
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Thiếu tên nhóm", "Vui lòng nhập tên nhóm.");
      return;
    }

    try {
      let thumbnail_url = "";

      if (images[0]) {
        thumbnail_url = await uploadGroupImage(images[0]); // ✅ upload ảnh trước
      }

      const res = await axios.post(`${path}/groups`, {
        name: groupName,
        isPublic: privacy === "public",
        thumbnail_url,
      });

      console.log("✅ Nhóm đã tạo:", res.data);
      Alert.alert("Thành công", "Nhóm đã được tạo.");
      navigation.goBack();
    } catch (err) {
      console.error("❌ Lỗi tạo nhóm:", err);
      Alert.alert("Lỗi", "Không thể tạo nhóm. Vui lòng thử lại.");
    }
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

          {/* Ảnh nhóm */}
          <View className="mt-6">
            <Text className="text-base font-medium mb-2">
              Ảnh nhóm (tùy chọn)
            </Text>
            <TouchableOpacity
              onPress={handleUploadImage}
              className="flex-row items-center p-3 border border-gray-300 rounded-lg"
            >
              <MaterialCommunityIcons
                name="camera-plus"
                size={24}
                color="#f59e0b"
              />
              <Text className="ml-3 text-base text-blue-500 font-medium">
                Chọn ảnh từ thư viện
              </Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <View className="mt-4">
                <Image
                  source={{ uri: images[0] }}
                  style={{ width: "100%", height: 180, borderRadius: 12 }}
                />
                <TouchableOpacity
                  onPress={removeImage}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    backgroundColor: "#fff",
                    borderRadius: 20,
                  }}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={24}
                    color="red"
                  />
                </TouchableOpacity>
              </View>
            )}
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
