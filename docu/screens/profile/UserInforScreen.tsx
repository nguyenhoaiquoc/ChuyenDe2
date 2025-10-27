import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Image, useWindowDimensions, TouchableOpacity } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { StatusBar } from "expo-status-bar";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { path } from "../../config";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "UserInforScreen">;
};

const DisplayingRoute = () => (
  <View className="flex-1 items-center justify-center py-10">
    <Text className="font-semibold text-gray-800">Bạn chưa có tin đăng nào</Text>
    <Text className="bg-yellow-400 px-8 rounded-md py-1 mt-2">Đăng tin Ngay</Text>
  </View>
);

const SoldRoute = () => (
  <View className="flex-1 items-center justify-center py-10">
    <Text className="font-semibold text-gray-500">Bạn chưa bán sản phẩm nào</Text>
    <Text className="bg-yellow-400 px-8 rounded-md py-1 mt-2">Đăng tin mới</Text>
  </View>
);

export default function UserInforScreen({ navigation }: Props) {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "displaying", title: "Đang hiển thị (0)" },
    { key: "sold", title: "Đã bán (0)" },
  ]);

  const renderScene = SceneMap({
    displaying: DisplayingRoute,
    sold: SoldRoute,
  });
   const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

 useEffect(() => {
  const fetchUser = async () => {
    const userId = await AsyncStorage.getItem("userId");
    const token = await AsyncStorage.getItem("token");

    if (!userId) return;

    try {
      const res = await axios.get(`${path}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setName(res.data.name || res.data.fullName || "");
        setAvatar(res.data.image || null);
        setCoverImage(res.data.coverImage || null);

        await AsyncStorage.setItem("userName", res.data.name || res.data.fullName || "");
      }
    } catch (err) {
      console.log("Lấy user error:", err);
      
      // fallback nếu request fail
      const localName = await AsyncStorage.getItem("userName");
      if (localName) setName(localName);
    }
  };

  fetchUser();
}, []);


const handlePickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return alert("Cần quyền truy cập ảnh");

  const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images });
  if (result.canceled) return;

  const userId = await AsyncStorage.getItem("userId");
  const token = await AsyncStorage.getItem("token");
  if (!userId) return alert("Vui lòng đăng nhập trước khi đổi ảnh");

  const formData = new FormData();
  formData.append("image", { uri: result.assets[0].uri, name: "avatar.jpg", type: "image/jpeg" } as any);

  try {
    const url = `${path}/users/${userId}`;
    console.log("📌 Upload URL:", url);
    const response = await axios.patch(url, formData, {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
    });
        setAvatar(response.data.image);
    alert("Cập nhật ảnh thành công!");
  } catch (err: any) {
    console.log("Upload error:", err.response?.status, err.response?.data || err);
    alert("Upload thất bại");
  }
};


  return (
    <ScrollView className="flex-1">
      <View className="mt-10">
        <StatusBar style="auto" />
        {/* Header */}
        <View className="flex flex-row gap-6 pl-6 items-center">
          <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
          <Text className="text-xl">{name || "Đang tải..."} </Text>
        </View>

        {/* Ảnh bìa + avatar */}
        <View className="w-full h-[100px] relative mt-2">
          <Image
  className="w-full h-full object-contain"
  source={
    coverImage
      ? { uri: coverImage.startsWith("http") ? coverImage : `${path}${coverImage}` }
      : require("../../assets/anhbia.jpg") // fallback nếu chưa có cover
  }
/>

          <MaterialIcons onPress={handlePickImage}  className="absolute right-5 top-1/4 bg-white rounded-full p-1" name="camera-alt" size={16} color="black" />

          <TouchableOpacity  className="w-[60px] h-[60px] absolute -bottom-6 left-5 bg-white p-1 rounded-full">
              <Image
    className="w-full h-full object-contain rounded-full"
    source={
      avatar
        ? { uri: avatar.startsWith("http") ? avatar : `${path}${avatar}` }
        : require("../../assets/meo.jpg")
    }
  />
            <MaterialIcons  onPress={handlePickImage} className="absolute right-0 bottom-0 bg-white rounded-full p-1" name="camera-alt" size={10} color="black" />
          </TouchableOpacity>
        </View>

        {/* Nút chỉnh sửa */}
        <View className="flex flex-row justify-end gap-4 mt-8 mr-4">
          <TouchableOpacity onPress={() => navigation.navigate("EditProfileScreen")}>
          <Text  className="text-xs border p-1 rounded-md border-gray-400">Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
          <Text className="text-xs p-1 bg-yellow-400 rounded-md px-2">Chia sẻ</Text>
        </View>

        {/* Thông tin người dùng */}
        <View className="pl-3 mt-4 flex flex-col gap-3">
          <Text className="font-bold">{name || "Đang tải..."} </Text>
          <Text className="text-sm text-gray-600">chưa có đánh giá</Text>
          <View className="flex flex-row gap-3">
            <Text className="border-r pr-2 text-xs">Người theo dõi: 1</Text>
            <Text className="text-xs">Đang theo dõi: 1</Text>
          </View>
        </View>

        {/* Mô tả + trạng thái */}
        <View className="pl-3 flex flex-col mt-6 gap-3">
          <View className="flex flex-row gap-1 items-center">
            <MaterialIcons name="chat" size={16} color="gray" />
            <Text className="text-xs text-gray-600">Phản hồi chat: chưa có thông tin</Text>
          </View>
          <View className="flex flex-row gap-1 items-center">
            <MaterialIcons name="calendar-today" size={16} color="gray" />
            <Text className="text-xs text-gray-600">Đã tham gia: 6 tháng</Text>
          </View>
          <View className="flex flex-row gap-1 items-center">
            <MaterialIcons name="check-circle" size={16} color="gray" />
            <Text className="text-xs text-gray-600">Đã xác thực: </Text>
            <MaterialIcons name="mail" size={16} color="blue" />
          </View>
          <View className="flex flex-row gap-1 items-center">
            <MaterialIcons name="near-me" size={16} color="gray" />
            <Text className="text-xs text-gray-600">Địa chỉ: Chưa cung cấp</Text>
          </View>
          <View className="flex flex-row gap-1 items-center">
            <MaterialIcons name="more-horiz" size={16} color="blue" />
            <Text className="text-xs text-blue-600">Xem thêm</Text>
          </View>
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
                indicatorStyle={{ backgroundColor: "#facc15", height: 3, borderRadius: 2 }}
                style={{ backgroundColor: "white", elevation: 0, shadowOpacity: 0 }}
                labelStyle={{ color: "#000", fontWeight: "600", textTransform: "none", fontSize: 13 }}
                activeColor="#000"
                inactiveColor="#9ca3af"
              />
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
}
