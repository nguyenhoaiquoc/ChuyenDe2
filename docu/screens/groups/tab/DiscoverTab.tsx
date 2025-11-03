import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { path } from "../../../config";
import { GroupType, RootStackParamList } from "../../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GroupSuggestionCard = ({
  group,
  onJoin,
}: {
  group: GroupType;
  onJoin: (groupId: number) => void;
}) => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View className="w-[48%] mb-4 bg-white rounded-lg border border-gray-200">
      <TouchableOpacity
        key={group.id}
        className="flex-row items-center p-4 my-4 bg-white rounded-xl border-gray-500 shadow-sm"
        onPress={() =>
          navigation.navigate("GroupDetailScreen", { group: group })
        }
      >
        <ImageBackground
          source={
            typeof group.image === "string" ? { uri: group.image } : group.image
          }
          className="h-28 w-full"
          imageStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        >
          <TouchableOpacity className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
            <Feather name="x" size={16} color="white" />
          </TouchableOpacity>
        </ImageBackground>
      </TouchableOpacity>

      <View className="p-3">
        <Text className="font-bold text-sm leading-5" numberOfLines={2}>
          {group.name}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {group.isPublic ? "Nhóm Công khai" : "Nhóm Riêng tư"} ·{" "}
          {group.memberCount} thành viên
        </Text>

        <View className="flex-row items-center mt-2">
          <Image
            source={require("../../../assets/khi.png")}
            className="w-5 h-5 rounded-full border-2 border-white"
          />
          <Text className="text-xs text-gray-500 ml-2 flex-1">
            Le Duc Quy và 5 người bạn...
          </Text>
        </View>

        <TouchableOpacity
          className="bg-blue-100 mt-3 py-2 rounded-md"
          onPress={() => onJoin(Number(group.id))}
        >
          <Text className="text-blue-600 font-semibold text-center text-sm">
            Tham gia
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function DiscoverTab() {
  const [suggestedGroups, setSuggestedGroups] = useState<GroupType[]>([]);

  useEffect(() => {
    const fetchSuggestedGroups = async () => {
      const token = await AsyncStorage.getItem("token");

      try {
        const res = await axios.get(`${path}/groups/suggestions`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const mapped = res.data.map((g: any) => ({
          ...g,
          image: g.image || require("../../../assets/khi.png"),
          memberCount: g.memberCount || "0 thành viên",
        }));

        setSuggestedGroups(mapped);
      } catch (err) {
        console.log("❌ Lỗi lấy nhóm gợi ý:", err);
      }
    };

    fetchSuggestedGroups();
  }, []);

  const handleJoin = async (groupId: number) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await axios.post(`${path}/groups/${groupId}/join`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("✅ Đã tham gia nhóm!");
    } catch (err) {
      console.error("❌ Lỗi khi tham gia nhóm:", err);
      Alert.alert("❌ Không thể tham gia nhóm");
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 mb-10">
      <View className="p-4">
        <Text className="text-lg font-bold mb-3">Gợi ý cho bạn</Text>
        <View className="flex-row flex-wrap justify-between">
          {suggestedGroups.map((group) => (
            <GroupSuggestionCard
              key={group.id}
              group={group}
              onJoin={handleJoin}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
