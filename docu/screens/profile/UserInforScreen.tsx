import React, { useEffect, useState, useCallback } from "react";
import * as ImagePicker from 'expo-image-picker';
import {
  ScrollView,
  Text,
  View,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../config";
import { ActionSheetIOS, Platform, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Dùng hook chuẩn

// Types
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "UserInforScreen">;
  // Xóa route vì không dùng onUpdate
};

// Route Components
const DisplayingRoute = () => (
  <View className="flex-1 items-center justify-center py-10">
    <Text className="font-semibold text-gray-800">Bạn chưa có tin đăng nào</Text>
    <TouchableOpacity>
      <Text className="bg-yellow-400 px-8 rounded-md py-1 mt-2">Đăng tin Ngay</Text>
    </TouchableOpacity>
  </View>
);

const SoldRoute = () => (
  <View className="flex-1 items-center justify-center py-10">
    <Text className="font-semibold text-gray-500">Bạn chưa bán sản phẩm nào</Text>
    <TouchableOpacity>
      <Text className="bg-yellow-400 px-8 rounded-md py-1 mt-2">Đăng tin mới</Text>
    </TouchableOpacity>
  </View>
);

// Main Component
export default function UserInforScreen({ navigation }: Props) { // Xóa route
  const layout = useWindowDimensions();

  // States
  const [index, setIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [routes] = useState([
    { key: "displaying", title: "Đang hiển thị (0)" },
    { key: "sold", title: "Đã bán (0)" },
  ]);

  const renderScene = SceneMap({
    displaying: DisplayingRoute,
    sold: SoldRoute,
  });

  // --- Data Fetching (Dùng useFocusEffect) ---
  const fetchUser = useCallback(async () => {
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");
    if (!userId) return;

    try {
      const res = await axios.get(`${path}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setAvatar(res.data.image || null);
      setCoverImage(res.data.coverImage || null);
    } catch (err: any) {
      console.log("Lỗi khi lấy user:", err.message);
    }
  }, []); // Dependency rỗng

  // Tự động gọi fetchUser mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser])
  );


  // Helper Function
  function timeSince(dateString: string) {
    if (!dateString) return "Mới tham gia";
    const diff = Date.now() - new Date(dateString).getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0)
      return `${years} năm ${remainingMonths > 0 ? remainingMonths + " tháng" : ""}`;
    if (months > 0)
      return `${months} tháng`;
    return "Mới tham gia";
  }

  // --- LOGIC TẢI ẢNH (ĐÃ TÁCH RIÊNG) ---

  // HÀM 1: UPLOAD ẢNH
  const uploadImage = async (field: "image" | "coverImage", fileUri: string) => {
    if (!fileUri) return alert("Lỗi: Không có đường dẫn ảnh!");
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");
    if (!userId || !token) return alert("Vui lòng đăng nhập!");
    setIsUploading(true);
    const formData = new FormData();
    formData.append(field, {
      uri: fileUri,
      name: `photo.jpg`,
      type: "image/jpeg",
    } as any);

    try {
      const res = await axios.patch(`${path}/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedUser = res.data;
      if (!updatedUser) return alert("Upload thành công nhưng không nhận được dữ liệu user!");
      if (field === "image") setAvatar(updatedUser.image);
      if (field === "coverImage") setCoverImage(updatedUser.coverImage);
      setUser(updatedUser);
      alert("Cập nhật ảnh thành công!");
    } catch (err: any) {
      console.log("Upload Error:", err.response?.data || err.message || err);
      alert("Upload thất bại!");
    } finally {
      setIsUploading(false);
    }
  };
  
  // HÀM 2: CHỌN HOẶC CHỤP ẢNH
  const pickAndUpload = async (field: 'image' | 'coverImage', source: 'camera' | 'library') => {
    try {
      let result;
      const imagePickerOptions: ImagePicker.ImagePickerOptions = {
        allowsEditing: true,
        quality: 0.8,
        aspect: field === 'image' ? [1, 1] : [16, 9],
        mediaTypes: 'images', // ✅ Sửa lỗi (dùng chữ thường)
      };

      if (source === 'camera') {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) return alert("Cần quyền camera");
        result = await ImagePicker.launchCameraAsync(imagePickerOptions);
      } else {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) return alert("Cần quyền thư viện");
        result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
      }
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const uri = result.assets[0].uri;
      await uploadImage(field, uri);
    } catch (err) {
      console.log("Picker error:", err);
    }
  };

  // HÀM 3: XOÁ ẢNH
  const deleteImage = async (field: 'image' | 'coverImage') => {
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');
    if (!userId) return alert("Vui lòng đăng nhập trước!");
    if (isUploading) return;
    setIsUploading(true);

    try {
      const res = await axios.patch(
        `${path}/users/${userId}`,
        { [field]: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = res.data;
      if (field === 'image') setAvatar(updatedUser.image);
      if (field === 'coverImage') setCoverImage(updatedUser.coverImage);
      setUser(updatedUser);
      alert('Đã xoá ảnh thành công!');
    } catch (err: any) {
      console.log('Delete Error:', err.response?.data || err);
      alert('Xoá ảnh thất bại!');
    } finally {
      setIsUploading(false);
    }
  };

  // HÀM 4: HIỂN THỊ MENU
  const handleImageOptions = (field: 'image' | 'coverImage') => {
    if (isUploading) return;
    const options = [ 'Chọn ảnh từ thư viện', 'Xoá ảnh hiện tại', 'Hủy'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 3, destructiveButtonIndex: 2 },
        (index) => {
         
          if (index === 1) pickAndUpload(field, 'library');
          if (index === 2) deleteImage(field);
        }
      );
    } else {
      Alert.alert(
        'Chọn hành động', '',
        [
         
          { text: 'Chọn ảnh từ thư viện', onPress: () => pickAndUpload(field, 'library') },
          { text: 'Xoá ảnh hiện tại', onPress: () => deleteImage(field), style: 'destructive' },
          { text: 'Hủy', style: 'cancel' },
        ]
      );
    }
  };

  // --- HẾT LOGIC TẢI ẢNH ---

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="flex flex-row gap-6 pl-6 items-center mt-10">
        <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
        <Text className="text-xl font-semibold">
          {user?.fullName || "Đang tải..."}
        </Text>
      </View>

      {/* Ảnh bìa */}
      <View className="w-full h-[100px] relative mt-2">
     
        <Image
          key={coverImage} 
          className="w-full h-full object-cover"
          source={
            coverImage
              ? {
                  uri: (coverImage.startsWith("http") 
                    ? coverImage 
                    : `${path}/${coverImage.replace(/\\/g, '/')}`) + `?t=${Date.now()}`
              }
              : undefined
          }
          style={{ backgroundColor: '#d1d5db' }}
        />
        <TouchableOpacity
          onPress={() => handleImageOptions("coverImage")}
          disabled={isUploading}
          className="absolute right-5 top-1/4 bg-white rounded-full p-1"
        >
          <MaterialIcons name="camera-alt" size={16} color="black" />
        </TouchableOpacity>

        {/* Avatar */}
        <View className="w-[60px] h-[60px] absolute -bottom-6 left-5 bg-white p-1 rounded-full">
       
          <Image
            key={avatar}
            className="w-full h-full object-cover rounded-full"
            source={
              avatar
                ? {
                  uri: (avatar.startsWith("http") 
                    ? avatar 
                    : `${path}/${avatar.replace(/\\/g, '/')}`) + `?t=${Date.now()}`
                }
                : undefined
            }
            style={{ backgroundColor: '#d1d5db' }}
          />
          <TouchableOpacity
            onPress={() => handleImageOptions("image")}
            disabled={isUploading}
            className="absolute right-0 bottom-0 bg-white rounded-full p-1"
          >
            <MaterialIcons name="camera-alt" size={10} color="black" />
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {isUploading && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 flex items-center justify-center">
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Nút chỉnh sửa (Đã xóa onUpdate) */}
      <View className="flex flex-row justify-end gap-4 mt-8 mr-4">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditProfileScreen") // ✅ XÓA onUpdate
          }
        >
          <Text className="text-xs border p-1 rounded-md border-gray-400">
            Chỉnh sửa thông tin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-xs p-1 bg-yellow-400 rounded-md px-2">Chia sẻ</Text>
        </TouchableOpacity>
      </View>

     
      <View className="pl-3 mt-[-10px] flex flex-col gap-2">
        <Text className="font-bold text-lg">{user?.fullName || "..."}</Text>
        <Text className="text-sm text-gray-600">Chưa có đánh giá</Text>
        <View className="flex flex-row gap-3">
          <Text className="border-r pr-2 text-xs text-gray-700">
            Người theo dõi: 0
          </Text>
          <Text className="text-xs text-gray-700">Đang theo dõi: 0</Text>
        </View>
      </View>

      {/* ✅ SỬA LẠI TOÀN BỘ GIAO DIỆN Chi tiết người dùng */}
      <View className="pl-3 pr-4 flex flex-col mt-6 gap-3 mb-4">
        
        {/* ---- PHẦN HIỂN THỊ CỐ ĐỊNH ---- */}
        <View className="flex flex-row gap-2 items-center">
          <MaterialIcons name="chat" size={16} color="gray" />
          <Text className="text-xs text-gray-600">Phản hồi chat: Chưa có</Text>
        </View>
        <View className="flex flex-row gap-2 items-center">
          <MaterialIcons name="access-time" size={16} color="gray" />
          <Text className="text-xs text-gray-600">
            Đã tham gia: {timeSince(user?.createdAt)}
          </Text>
        </View>
        <View className="flex flex-row gap-2 items-center">
          <MaterialIcons name="verified-user" size={16} color="gray" />
          <Text className="text-xs text-gray-600">Đã xác thực:</Text>
          {user?.isFacebookVerified || user?.isAppleVerified ? (
            <View className="flex flex-row gap-2 items-center ml-1">
              {user?.isFacebookVerified && (
                <FontAwesome name="facebook-square" size={16} color="#1877F2" />
              )}
              {user?.isAppleVerified && (
                <Ionicons name="logo-apple" size={16} color="#000" />
              )}
            </View>
          ) : (
            <Text className="text-xs text-gray-500 ml-1">Chưa xác thực</Text>
          )}
        </View>
        <View className="flex flex-row gap-2 items-center">
          <MaterialIcons name="near-me" size={16} color="gray" />
          <Text className="text-xs text-gray-600">
            Địa chỉ: {user?.address_json?.full || "Chưa cung cấp"}
          </Text>
        </View>

        {/* Nút xem thêm/ẩn */}
        <TouchableOpacity
          className="mt-1"
          onPress={() => setShowMore(!showMore)}
        >
          <Text className="text-xs text-yellow-500 font-semibold">
            {showMore ? "Ẩn thông tin" : "Xem thêm thông tin"}
          </Text>
        </TouchableOpacity>

        {/* ---- PHẦN ẨN/HIỆN (SỬA LẠI GIAO DIỆN CHO GIỐNG ẢNH) ---- */}
        {showMore && (
          <View className="flex flex-col gap-3 mt-2">
    
            {/* Số điện thoại */}
            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons name="phone" size={16} color="gray" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">Số điện thoại:</Text>
                <Text className="text-xs text-gray-800 font-medium">
                  {user?.phone || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            {/* Giới thiệu */}
            <View className="flex flex-row gap-2 items-start">
              <MaterialIcons name="info-outline" size={16} color="gray" className="mt-0.5" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">Giới thiệu:</Text>
                <Text className="text-xs text-gray-800 font-medium w-3/5 text-right" numberOfLines={3}>
                  {user?.bio || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            {/* Tên gợi nhớ */}
            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons name="person-outline" size={16} color="gray" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">Tên gợi nhớ:</Text>
                <Text className="text-xs text-gray-800 font-medium">
                  {user?.nickname || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            {/* CCCD */}
            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons name="badge" size={16} color="gray" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">CCCD / CMND:</Text>
                <Text className="text-xs text-gray-800 font-medium">
                  {user?.citizenId ? '******' + user.citizenId.slice(-4) : "Chưa cập nhật"}
                </Text>
              </View>
            </View>
            
            {/* Giới tính (SỬA LOGIC HIỂN THỊ) */}

            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons name="wc" size={16} color="gray" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">Giới tính:</Text>
                <Text className="text-xs text-gray-800 font-medium">
                  {/* Map số (1, 2, 3) hoặc chữ thành chữ */}
                  { user?.gender === 1 || user?.gender === 'Nam' ? 'Nam'
                  : user?.gender === 2 || user?.gender === 'Nữ' ? 'Nữ'
                  : (user?.gender === 3 || user?.gender === 'Khác') ? 'Khác'
                  : 'Chưa cập nhật' }
                </Text>
              </View>
            </View>

            {/* Ngày sinh */}
            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons name="cake" size={16} color="gray" />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">Ngày sinh:</Text>
                <Text className="text-xs text-gray-800 font-medium">
                  {user?.dob
                    ? new Date(user.dob).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="mt-8 h-[350px]">
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={(props: any) => (
            <TabBar
              {...props}
              indicatorStyle={{
                backgroundColor: "#facc15",
                height: 3,
                borderRadius: 2,
              }}
              style={{
                backgroundColor: "white",
                elevation: 0,
                shadowOpacity: 0,
              }}
              labelStyle={{
                color: "#000",
                fontWeight: "600",
                textTransform: "none",
                fontSize: 13,
              }}
              activeColor="#000"
              inactiveColor="#9ca3af"
            />
          )}
        />
      </View>
 </ScrollView>
  );
}
