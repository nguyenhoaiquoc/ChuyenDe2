import React, { useEffect, useState } from "react";
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

// Types
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "UserInforScreen">;
  route: {
    params?: {
      onUpdate?: (updatedUser: any) => void;
    };
  };
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
export default function UserInforScreen({ navigation, route }: Props) {
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

  // Data Fetching
  useEffect(() => {
    const fetchUser = async () => {
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

        if (route.params?.onUpdate) {
            route.params.onUpdate(res.data);
        }

      } catch (err) {
        console.log("Lỗi khi lấy user:", err);
      }
    };
    fetchUser();
  }, [route.params?.onUpdate]);

  // Helper Function
  function timeSince(dateString: string) {
    if (!dateString) return "Không rõ";
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

  // HÀM 1: UPLOAD ẢNH (Gửi file lên server)
  const uploadImage = async (field: 'image' | 'coverImage', fileUri: string) => {
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');
    if (!userId) return alert("Vui lòng đăng nhập trước!");

    setIsUploading(true);
    const formData = new FormData();
    formData.append(field, { uri: fileUri, name: `${field}.jpg`, type: 'image/jpeg' } as any);

    // Sử dụng endpoint chung /users/:id
    const url = `${path}/users/${userId}`;

    try {
      const res = await axios.patch(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });

      if (field === 'image') setAvatar(res.data.image);
      if (field === 'coverImage') setCoverImage(res.data.coverImage);
      
      alert('Cập nhật ảnh thành công!');
      
    } catch (err: any) {
      console.log(err.response?.data || err);
      alert('Upload ảnh thất bại!');
    } finally {
      setIsUploading(false);
    }
  };

  // HÀM 2: CHỌN HOẶC CHỤP ẢNH (Mở camera/library rồi gọi uploadImage)
  const pickAndUpload = async (field: 'image' | 'coverImage', source: 'camera' | 'library') => {
    const imagePickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: (field === 'image' ? [1, 1] : [16, 9]) as [number, number],
    };

    let result: ImagePicker.ImagePickerResult;
    
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return alert("Cần quyền truy cập camera");
        result = await ImagePicker.launchCameraAsync(imagePickerOptions);
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return alert("Cần quyền truy cập thư viện ảnh");
        result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Sau khi có ảnh, gọi hàm upload
        await uploadImage(field, result.assets[0].uri);
      }
    } catch (err) {
      console.log("ImagePicker Error:", err);
    }
  };

  // HÀM 3: XOÁ ẢNH (Gửi { [field]: null } lên server)
  const deleteImage = async (field: 'image' | 'coverImage') => {
    const userId = await AsyncStorage.getItem('userId');
    const token = await AsyncStorage.getItem('token');
    if (!userId) return alert("Vui lòng đăng nhập trước!");
    setIsUploading(true);

    const url = `${path}/users/${userId}`;

    try {
      // Gửi { image: null } hoặc { coverImage: null }
      await axios.patch(url, { [field]: null }, {
         headers: { Authorization: `Bearer ${token}` } 
      });

      if (field === 'image') setAvatar(null);
      if (field === 'coverImage') setCoverImage(null);

      alert('Đã xoá ảnh thành công!');
    } catch (err: any) {
      console.log(err.response?.data || err);
      alert('Xoá ảnh thất bại!');
    } finally {
      setIsUploading(false);
    }
  };

  // HÀM 4: HIỂN THỊ MENU LỰA CHỌN (Gọn gàng)
  const handleImageOptions = (field: 'image' | 'coverImage') => {
    if(isUploading) return;

    const options = ['Chụp ảnh mới', 'Chọn ảnh từ thư viện', 'Xoá ảnh hiện tại', 'Hủy'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 3, destructiveButtonIndex: 2 },
        (index) => {
          if (index === 0) pickAndUpload(field, 'camera');
          if (index === 1) pickAndUpload(field, 'library');
          if (index === 2) deleteImage(field);
        }
      );
    } else {
      Alert.alert(
        'Chọn hành động', '',
        [
          { text: 'Chụp ảnh mới', onPress: () => pickAndUpload(field, 'camera') },
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
          className="w-full h-full object-cover bg-gray-200"
          source={
            coverImage
              ? { uri: coverImage.startsWith("http") ? coverImage : `${path}${coverImage}` }
              : require("../../assets/anhbia.jpg")
          }
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
            className="w-full h-full object-cover rounded-full bg-gray-200"
            source={
              avatar
                ? { uri: avatar.startsWith("http") ? avatar : `${path}${avatar}` }
                : require("../../assets/meo.jpg")
            }
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
      
      {/* Nút chỉnh sửa + chia sẻ */}
      <View className="flex flex-row justify-end gap-4 mt-8 mr-4">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditProfileScreen", {
              onUpdate: (updatedUser) => {
                setUser(updatedUser);
              },
            })
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

      {/* Thông tin người dùng */}
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

      {/* Chi tiết người dùng */}
      <View className="pl-3 flex flex-col mt-6 gap-3 mb-4">
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
        
        {/* Nút xem thêm */}
        <TouchableOpacity
          className="mt-1"
          onPress={() => setShowMore(!showMore)}
        >
          <Text className="text-xs text-yellow-500 font-semibold">
            {showMore ? "Ẩn thông tin" : "Xem thêm thông tin"}
          </Text>
        </TouchableOpacity>

        {/* Các trường bổ sung */}
        {showMore && (
          <>
            <View className="flex flex-row gap-2 items-center mt-1">
              <MaterialIcons name="info-outline" size={16} color="gray" />
              <Text className="text-xs text-gray-600">
                Giới thiệu:{" "}
                <Text className="text-gray-800">
                  {user?.bio || "Chưa cập nhật"}
                </Text>
              </Text>
            </View>

            <View className="flex flex-row gap-2 items-center mt-1">
              <MaterialIcons name="person-outline" size={16} color="gray" />
              <Text className="text-xs text-gray-600">
                Tên gợi nhớ:{" "}
                <Text className="text-gray-800">
                  {user?.nickname || "Chưa cập nhật"}
                </Text>
              </Text>
            </View>

            <View className="flex flex-row gap-2 items-center mt-1">
              <MaterialIcons name="badge" size={16} color="gray" />
              <Text className="text-xs text-gray-600">
                CCCD / CMND / Hộ chiếu:{" "}
                <Text className="text-gray-800">
                  {user?.citizenId ? '******' + user.citizenId.slice(-4) : "Chưa cập nhật"}
                </Text>
              </Text>
            </View>

            <View className="flex flex-row gap-2 items-center mt-1">
              <MaterialIcons name="wc" size={16} color="gray" />
              <Text className="text-xs text-gray-600">
                Giới tính:{" "}
                <Text className="text-gray-800">
                  {user?.gender || "Chưa cập nhật"}
                </Text>
              </Text>
            </View>

            <View className="flex flex-row gap-2 items-center mt-1">
              <MaterialIcons name="cake" size={16} color="gray" />
              <Text className="text-xs text-gray-600">
                Ngày sinh:{" "}
                <Text className="text-gray-800">
                  {user?.dob
                    ? new Date(user.dob).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </Text>
              </Text>
            </View>
          </>
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