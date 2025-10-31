import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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

export default function ManagerGroupsScreen() {
  const tabs = ["Dành cho bạn", "Nhóm của bạn", "Bài viết", "Khám phá"];

  const [selectedTab, setSelectedTab] = useState("Dành cho bạn");

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
    };
    checkToken();
  }, []);

  //  Lấy đối tượng navigation
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const handleViewAllGroups = () => {
    setSelectedTab("Nhóm của bạn");
  };

  //  Hàm render nội dung sẽ trả về component tương ứng
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
                //  Chức năng tạo bài viết
                onPress={() => console.log("dăng bài")}
                className="bg-gray-100 p-2 rounded-full"
              >
                <Feather name="edit" size={20} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                // Chức năng TẠO NHÓM, điều hướng tới màn hình mới
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
        </>
      )}
    </SafeAreaView>
  );
}
