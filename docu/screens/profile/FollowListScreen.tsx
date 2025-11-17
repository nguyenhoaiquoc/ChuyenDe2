import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,

  ActivityIndicator,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, User } from '../../types'; // 👈 Import User
import axios from 'axios';
import { path } from '../../config';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'; // 👈 Import TabView
import '../../global.css';

type NavProps = NativeStackNavigationProp<RootStackParamList, 'FollowListScreen'>;
type RouteProps = RouteProp<RootStackParamList, 'FollowListScreen'>;

// ---------------------------------
// Component con: 1 HÀNG USER
// ---------------------------------
const UserRow = ({ item, navigation }: { item: User, navigation: NavProps }) => (
  <TouchableOpacity
    className="flex-row items-center p-4 border-b border-gray-100"
    onPress={() => {
      // ❗️ Lưu ý: Ông cần truyền đủ params mà UserProfile cần
      // (Tạm thời chỉ truyền userId, productId có thể là undefined)
      navigation.navigate('UserProfile', {
        userId: item.id,
        productId: '0', // Hoặc 1 ID mặc định
        // product: undefined, 
      });
    }}
  >
    <Image
      source={{
        uri: item.image
          ? item.image.startsWith("http") ? item.image : `${path}${item.image}`
          : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      }}
      className="w-12 h-12 rounded-full"
    />
    <View className="ml-3">
      <Text className="font-semibold text-base">{item.fullName || item.name}</Text>
    </View>
    {/* (Sau này ông có thể thêm nút Follow/Unfollow ở đây) */}
  </TouchableOpacity>
);

// ---------------------------------
// Component con: Tab "Người theo dõi"
// ---------------------------------
const FollowersRoute = ({ userId, navigation }: { userId: string | number, navigation: NavProps }) => {
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused || !userId) return;
    setLoading(true);
    axios.get(`${path}/follow/${userId}/followers`)
      .then(res => {
        setList(res.data);
      })
      .catch(err => console.log("Lỗi tải followers:", err))
      .finally(() => setLoading(false));
  }, [userId, isFocused]); // Load lại khi focus

  if (loading) {
    return <ActivityIndicator size="large" className="mt-10" />;
  }

  if (list.length === 0) {
    return <Text className="text-center text-gray-500 mt-10">Chưa có ai theo dõi.</Text>;
  }

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <UserRow item={item} navigation={navigation} />}
    />
  );
};

// ---------------------------------
// Component con: Tab "Đang theo dõi"
// ---------------------------------
const FollowingRoute = ({ userId, navigation }: { userId: string | number, navigation: NavProps }) => {
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused || !userId) return;
    setLoading(true);
    axios.get(`${path}/follow/${userId}/following`)
      .then(res => {
        setList(res.data);
      })
      .catch(err => console.log("Lỗi tải following:", err))
      .finally(() => setLoading(false));
  }, [userId, isFocused]); // Load lại khi focus

  if (loading) {
    return <ActivityIndicator size="large" className="mt-10" />;
  }

  if (list.length === 0) {
    return <Text className="text-center text-gray-500 mt-10">Chưa theo dõi ai.</Text>;
  }

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <UserRow item={item} navigation={navigation} />}
    />
  );
};

// ---------------------------------
// MÀN HÌNH CHÍNH
// ---------------------------------
export default function FollowListScreen() {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const layout = useWindowDimensions();

  // Lấy data từ trang trước
  const { userId, initialTab } = route.params;

  // State cho TabView
  const [index, setIndex] = useState(initialTab === 'followers' ? 0 : 1);
  const [routes] = useState([
    { key: 'followers', title: 'Người theo dõi' },
    { key: 'following', title: 'Đang theo dõi' },
  ]);

  // Hàm render 2 tab (truyền userId và navigation xuống)
  const renderScene = SceneMap({
    followers: () => <FollowersRoute userId={userId} navigation={navigation} />,
    following: () => <FollowingRoute userId={userId} navigation={navigation} />,
  });

  return (
    <SafeAreaView className="flex-1 bg-white mt-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Theo dõi</Text>
        <View className="w-6" />{/* Spacer */}
      </View>

      {/* TabView */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{
              backgroundColor: "#f97316", // 👈 Màu cam (giống giao diện của ông)
              height: 3,
            }}
            style={{ backgroundColor: "white", elevation: 0, shadowOpacity: 0 }}
            labelStyle={{ color: "#000", fontWeight: "600", textTransform: "none" }}
            activeColor="#f97316"
            inactiveColor="#6b7280"
          />
        )}
      />
    </SafeAreaView>
  );
}