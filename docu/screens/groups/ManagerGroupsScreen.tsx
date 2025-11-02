import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Menu from "../../components/Menu";
import ForYouTab from "./tab/ForYouTab";
import YourGroupsTab from "./tab/YourGroupsTab";
import PostsTab from "./tab/PostsTab";
import DiscoverTab from "./tab/DiscoverTab";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GuestView from "./GuestViewSreen";
import axios from "axios";
import { path } from "../../config";

export default function ManagerGroupsScreen() {
  const tabs = ["Dành cho bạn", "Nhóm của bạn", "Bài viết", "Khám phá"];

  const [selectedTab, setSelectedTab] = useState("Dành cho bạn");
  const [token, setToken] = useState<string | null>(null);
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
    };
    checkToken();
  }, []);

  const handleViewAllGroups = () => {
    setSelectedTab("Nhóm của bạn");
  };

  // 🔍 Tìm kiếm bài viết trong tất cả nhóm
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const token = await AsyncStorage.getItem("token");

      // Lấy tất cả bài viết từ các nhóm user đã tham gia
      const res = await axios.get(`${path}/groups/my/group-posts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }, // Lấy nhiều để filter
      });

      // Filter theo query
      const filtered = res.data.filter((post: any) => {
        const q = query.toLowerCase();
        return (
          post.name?.toLowerCase().includes(q) ||
          post.authorName?.toLowerCase().includes(q) ||
          post.groupName?.toLowerCase().includes(q) ||
          post.tag?.toLowerCase().includes(q)
        );
      });

      setSearchResults(filtered);
    } catch (error) {
      console.log("Lỗi tìm kiếm:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const closeSearchModal = () => {
    setSearchModalVisible(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "Dành cho bạn":
        return (
          <ForYouTab
            navigation={navigation}
            onViewAllPress={handleViewAllGroups}
            onJoinMorePress={() => setSelectedTab("Khám phá")}
          />
        );
      case "Nhóm của bạn":
        return (
          <YourGroupsTab
            navigation={navigation}
            onJoinMorePress={() => setSelectedTab("Khám phá")}
          />
        );
      case "Bài viết":
        return <PostsTab navigation={navigation} limit={4} />;
      case "Khám phá":
        return <DiscoverTab />;
      default:
        return (
          <ForYouTab
            navigation={navigation}
            onViewAllPress={handleViewAllGroups}
            onJoinMorePress={() => setSelectedTab("Khám phá")}
          />
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {!token ? (
        <GuestView onLogin={() => navigation.navigate("LoginScreen")} />
      ) : (
        <>
          <View className="flex-row justify-between items-center px-4 pt-2 pb-4">
            <Text className="text-2xl font-bold">Nhóm</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setSearchModalVisible(true)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <Feather name="search" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("CreateGroupScreen")}
                className="bg-gray-100 p-2 rounded-full ml-3"
              >
                <Feather name="plus" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Thanh Tabs */}
          <View className="flex-row justify-around px-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                className={`py-3 px-1 ${
                  selectedTab === tab
                    ? "border-b-2 border-blue-500"
                    : "border-b-2 border-transparent"
                }`}
              >
                <Text
                  className={`font-semibold text-center ${
                    selectedTab === tab ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Vùng hiển thị nội dung động */}
          <View className="flex-1">{renderContent()}</View>

          {/* Menu dưới cùng */}
          <Menu />

          {/* Modal Tìm Kiếm */}
          <Modal
            visible={isSearchModalVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={closeSearchModal}
          >
            <SafeAreaView className="flex-1 bg-white">
              {/* Header */}
              <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={closeSearchModal}>
                  <Feather name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 ml-3">
                  <Feather name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    placeholder="Tìm kiếm bài viết trong nhóm..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    className="flex-1 h-10 ml-2 text-base"
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <Feather name="x-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Kết quả tìm kiếm */}
              {searching ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text className="mt-4 text-gray-600">Đang tìm kiếm...</Text>
                </View>
              ) : searchQuery.length > 0 ? (
                <View className="flex-1">
                  <View className="px-4 py-2 bg-gray-50">
                    <Text className="text-sm text-gray-600">
                      Tìm thấy {searchResults.length} kết quả
                    </Text>
                  </View>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          closeSearchModal();
                          navigation.navigate("ProductDetail", {
                            product: item,
                          });
                        }}
                        className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                      >
                        <View className="flex-row">
                          <Image
                            source={{ uri: item.image }}
                            className="w-24 h-24 rounded-lg bg-gray-100"
                            resizeMode="cover"
                          />
                          <View className="flex-1 ml-3">
                            <View className="flex-row items-center mb-1">
                              <Image
                                source={
                                  item.groupImage
                                    ? { uri: item.groupImage }
                                    : require("../../assets/meo.jpg")
                                }
                                className="w-5 h-5 rounded-full"
                              />
                              <Text
                                className="text-xs text-gray-600 ml-1"
                                numberOfLines={1}
                              >
                                {item.groupName}
                              </Text>
                            </View>
                            <Text
                              className="font-bold text-base"
                              numberOfLines={2}
                            >
                              {item.name}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">
                              Đăng bởi {item.authorName}
                            </Text>
                            {item.price && (
                              <Text className="text-blue-600 font-semibold mt-1">
                                {item.price}
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View className="items-center justify-center mt-20">
                        <Feather name="inbox" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-4 text-center">
                          Không tìm thấy bài viết nào phù hợp với từ khóa "
                          {searchQuery}"
                        </Text>
                      </View>
                    }
                  />
                </View>
              ) : (
                <View className="flex-1 justify-center items-center px-8">
                  <Feather name="search" size={64} color="#D1D5DB" />
                  <Text className="text-gray-600 mt-4 text-center text-base">
                    Nhập từ khóa để tìm kiếm bài viết trong các nhóm bạn đã tham
                    gia
                  </Text>
                  <Text className="text-gray-400 mt-2 text-center text-sm">
                    Bạn có thể tìm theo tên sản phẩm, người đăng, hoặc tên nhóm
                  </Text>
                </View>
              )}
            </SafeAreaView>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}
