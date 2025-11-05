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
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { path } from "../../../config";

type EditGroupScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditGroupScreen"
>;

export default function EditGroupScreen({
  navigation,
  route,
}: EditGroupScreenProps) {
  const { group } = route.params;

  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [image, setImage] = useState(group.image || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "group-image.jpg",
      } as any);

      const res = await axios.post(`${path}/groups/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setImage(res.data.url);
      Alert.alert("Thành công", "Đã tải ảnh lên");
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      Alert.alert("Lỗi", "Không thể tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");

      await axios.patch(
        `${path}/groups/${group.id}`,
        {
          name: name.trim(),
          description: description.trim(),
          thumbnail_url: image,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", "Đã cập nhật thông tin nhóm");
      navigation.goBack();
    } catch (error) {
      console.error("Lỗi cập nhật nhóm:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold ml-3">Sửa thông tin nhóm</Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg ${
            saving ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Image */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Ảnh nhóm</Text>
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={uploading}
            className="bg-white rounded-lg overflow-hidden border border-gray-300"
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-48"
                resizeMode="cover"
              />
            ) : (
              <View className="h-48 items-center justify-center bg-gray-100">
                <Feather name="image" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">Chọn ảnh nhóm</Text>
              </View>
            )}
            {uploading && (
              <View className="absolute inset-0 bg-black/50 items-center justify-center">
                <ActivityIndicator size="large" color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Tên nhóm</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên nhóm"
            className="bg-white px-4 py-3 rounded-lg border border-gray-300"
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Mô tả nhóm</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Nhập mô tả về nhóm"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="bg-white px-4 py-3 rounded-lg border border-gray-300"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}