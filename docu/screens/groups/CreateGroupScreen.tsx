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
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../../types";

export default function CreateGroupScreen() {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State cho mời bạn
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // --- Chọn ảnh nhóm ---
  const handlePickFromLibrary = async () => {
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

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Không có quyền truy cập camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });

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

    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${path}/groups/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });

    const result = await res.json();
    return result.url;
  };

  // --- Fetch danh sách users để mời ---
  const fetchUsersToInvite = async (search: string = "") => {
    setLoadingUsers(true);
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("🪪 [DEBUG] token from AsyncStorage:", token);
      console.log("🪪 [DEBUG] typeof token:", typeof token);

      const authHeader = `Bearer ${token}`;
      console.log("🪪 [DEBUG] Authorization header will be:", authHeader);

      const res = await axios.get(
        `${path}/users/search?q=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: authHeader },
        }
      );

      console.log("✅ [DEBUG] users response status:", res.status);
      setAvailableUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenInviteModal = () => {
    setShowInviteModal(true);
    fetchUsersToInvite();
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Thiếu tên nhóm", "Vui lòng nhập tên nhóm.");
      return;
    }

    setIsLoading(true);
    try {
      let thumbnail_url = "";
      if (images[0]) thumbnail_url = await uploadGroupImage(images[0]);

      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${path}/groups`,
        { name: groupName, thumbnail_url, invitedUserIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        "Thành công",
        selectedUsers.length > 0
          ? `Nhóm đã được tạo và đã gửi lời mời đến ${selectedUsers.length} người.`
          : "Nhóm đã được tạo."
      );
      navigation.goBack();
    } catch (err) {
      console.log("Lỗi tạo nhóm:", err);
      Alert.alert("Lỗi", "Không thể tạo nhóm. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
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
              editable={!isLoading}
              onChangeText={setGroupName}
              placeholder="Ví dụ: Hội yêu thú cưng Sài Gòn"
              className="border border-gray-300 rounded-lg p-3 text-base"
            />
          </View>

          {/* Nhóm riêng tư */}
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

          {/* Ảnh nhóm */}
          <View className="mt-6">
            <Text className="text-base font-medium mb-2">Ảnh nhóm</Text>
            <View className="flex-row space-x-4 mt-2">
              <TouchableOpacity
                onPress={handlePickFromLibrary}
                className="flex-1 flex-row items-center justify-center p-3 border border-gray-300 rounded-lg"
              >
                <MaterialCommunityIcons
                  name="image"
                  size={24}
                  color="#f59e0b"
                />
                <Text className="ml-2 text-base">Chọn từ thư viện</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-1 flex-row items-center justify-center p-3 border border-gray-300 rounded-lg"
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={24}
                  color="#10b981"
                />
                <Text className="ml-2 text-base">Chụp ảnh</Text>
              </TouchableOpacity>
            </View>

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

          {/* Mời bạn */}
          <View className="mt-10">
            <Text className="text-base font-medium mb-2">Mời bạn bè</Text>
            <TouchableOpacity
              onPress={handleOpenInviteModal}
              disabled={isLoading}
              className="flex-row items-center justify-between p-3 border border-gray-300 rounded-lg"
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="account-plus"
                  size={24}
                  color="#3b82f6"
                />
                <Text className="ml-3 text-base text-gray-700">
                  {selectedUsers.length > 0
                    ? `Đã chọn ${selectedUsers.length} người`
                    : "Chọn người để mời"}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Danh sách người được mời hiển thị ngay */}
          {selectedUsers.length > 0 && (
            <View className="mt-4 p-2 bg-gray-100 rounded-lg">
              <Text className="font-medium mb-2">Người được mời:</Text>
              {selectedUsers.map((userId) => {
                const user = availableUsers.find((u) => u.id === userId);
                if (!user) return null;
                return (
                  <View
                    key={user.id}
                    className="flex-row items-center justify-between p-2 border-b border-gray-200"
                  >
                    <View className="flex-row items-center">
                      <Image
                        source={
                          user.avatar
                            ? { uri: user.avatar }
                            : require("../../assets/khi.png")
                        }
                        className="w-10 h-10 rounded-full"
                      />
                      <Text className="ml-2">{user.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedUsers((prev) =>
                          prev.filter((id) => id !== user.id)
                        )
                      }
                    >
                      <Feather name="x" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Nút tạo nhóm */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={isLoading}
          className={`bg-blue-500 rounded-lg p-4 ${
            isLoading ? "opacity-70" : ""
          }`}
        >
          {isLoading ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                Đang tạo nhóm...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-center font-bold text-base">
              Tạo nhóm
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal mời bạn */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header Modal */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Mời bạn bè</Text>
            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
              <Feather name="search" size={20} color="gray" />
              <TextInput
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  fetchUsersToInvite(text);
                }}
                placeholder="Tìm kiếm tên..."
                className="flex-1 ml-2 text-base"
              />
            </View>
          </View>

          {/* Loading users */}
          {loadingUsers ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <FlatList
              data={availableUsers}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => {
                const isSelected = selectedUsers.includes(item.id);
                return (
                  <TouchableOpacity
                    onPress={() => handleToggleUser(item.id)}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-row items-center flex-1">
                      <Image
                        source={
                          item.avatar
                            ? { uri: item.avatar }
                            : require("../../assets/khi.png")
                        }
                        className="w-12 h-12 rounded-full"
                      />
                      <Text className="ml-3 font-semibold text-gray-900">
                        {item.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <Feather name="check" size={14} color="blue" />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="py-10 items-center">
                  <Feather name="users" size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-3">
                    Không tìm thấy người dùng
                  </Text>
                </View>
              }
            />
          )}

          {/* Xác nhận */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={() => setShowInviteModal(false)}
              className="bg-blue-500 rounded-lg p-4"
            >
              <Text className="text-white text-center font-bold text-base">
                Xác nhận ({selectedUsers.length})
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
