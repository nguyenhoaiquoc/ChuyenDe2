import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";
type Props = NativeStackScreenProps<RootStackParamList, "EditGroupScreen">;

export default function EditGroupScreen({ navigation, route }: Props) {
  const { group } = route.params;

  const [groupName, setGroupName] = useState(group.name || "");
  const [description, setDescription] = useState(group.description || "");
  const [image, setImage] = useState<string | null>(group.image || null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Không có quyền truy cập camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => setImage(null);

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

    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${path}/groups/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });

    const result = await res.json();
    return result.url;
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert("Thiếu tên nhóm", "Vui lòng nhập tên nhóm.");
      return;
    }

    setIsLoading(true);
    try {
      let thumbnail_url = group.image;

      // Nếu có ảnh mới và khác ảnh cũ
      if (image && image !== group.image) {
        thumbnail_url = await uploadGroupImage(image);
      }

      const token = await AsyncStorage.getItem("token");
      await axios.patch(
        `${path}/groups/${group.id}`,
        {
          name: groupName,
          description,
          thumbnail_url,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", "Đã cập nhật thông tin nhóm");
      navigation.goBack();
    } catch (err: any) {
      console.log("Lỗi cập nhật nhóm:", err);
      Alert.alert(
        "Lỗi",
        err.response?.data?.message || "Không thể cập nhật nhóm"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold ml-4">Chỉnh sửa nhóm</Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Tên nhóm */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2">Tên nhóm</Text>
          <TextInput
            value={groupName}
            editable={!isLoading}
            onChangeText={setGroupName}
            placeholder="Nhập tên nhóm"
            className="border border-gray-300 rounded-lg p-3 text-base"
          />
        </View>

        {/* Mô tả */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2">Mô tả nhóm</Text>
          <TextInput
            value={description}
            editable={!isLoading}
            onChangeText={setDescription}
            placeholder="Nhập mô tả về nhóm..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="border border-gray-300 rounded-lg p-3 text-base min-h-[100px]"
          />
        </View>

        {/* Ảnh nhóm */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2">Ảnh nhóm</Text>
          <View className="flex-row space-x-4 mt-2">
            <TouchableOpacity
              onPress={handlePickFromLibrary}
              disabled={isLoading}
              className="flex-1 flex-row items-center justify-center p-3 border border-gray-300 rounded-lg"
            >
              <MaterialCommunityIcons name="image" size={24} color="#f59e0b" />
              <Text className="ml-2 text-base">Chọn ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleTakePhoto}
              disabled={isLoading}
              className="flex-1 flex-row items-center justify-center p-3 border border-gray-300 rounded-lg"
            >
              <MaterialCommunityIcons name="camera" size={24} color="#10b981" />
              <Text className="ml-2 text-base">Chụp ảnh</Text>
            </TouchableOpacity>
          </View>

          {image && (
            <View className="mt-4">
              <Image
                source={{ uri: image }}
                style={{ width: "100%", height: 180, borderRadius: 12 }}
              />
              <TouchableOpacity
                onPress={removeImage}
                disabled={isLoading}
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

        {/* Thông tin nhóm */}
        <View className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <View className="flex-row items-center">
            <Feather name="lock" size={18} color="#3b82f6" />
            <Text className="ml-2 text-sm text-blue-800 font-medium">
              Nhóm Riêng tư
            </Text>
          </View>
          <Text className="text-xs text-blue-600 mt-1">
            Chỉ những người được mời mới có thể xem và tham gia nhóm.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
