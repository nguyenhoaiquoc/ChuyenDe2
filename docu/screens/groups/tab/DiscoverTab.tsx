import React from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type GroupSuggestionType = {
  id: string;
  title: string;
  image: any; // Hoặc ImageSourcePropType từ 'react-native'
  memberCount: string;
  commonFriends: {
    count: number;
    avatars: any[];
  };
};

const suggestedGroups: GroupSuggestionType[] = [
  {
    id: "1",
    title: "Dạy Nấu Ăn Ngon",
    image: require("../../../assets/655428.jpg"),
    memberCount: "2 triệu",
    commonFriends: {
      count: 14,
      avatars: [
        require("../../../assets/khi.png"),
        require("../../../assets/khi.png"),
      ],
    },
  },
  {
    id: "2",
    title: "Thủ thuật Excel, Word, PowerPoint",
    image: require("../../../assets/meo.jpg"),
    memberCount: "704K",
    commonFriends: {
      count: 13,
      avatars: [
        require("../../../assets/khi.png"),
        require("../../../assets/khi.png"),
      ],
    },
  },
  {
    id: "3",
    title: "NGHIỆN DECOR - SĂN DECOR GIÁ RẺ",
    image: require("../../../assets/meo.jpg"),
    memberCount: "1,4 triệu",
    commonFriends: {
      count: 47,
      avatars: [
        require("../../../assets/khi.png"),
        require("../../../assets/khi.png"),
      ],
    },
  },
  {
    id: "4",
    title: "Biết thì thừa thốt, không biết thì đọc...",
    image: require("../../../assets/meo.jpg"),
    memberCount: "1 triệu",
    commonFriends: {
      count: 8,
      avatars: [
        require("../../../assets/khi.png"),
        require("../../../assets/khi.png"),
      ],
    },
  },
  {
    id: "5",
    title: "Dạy Nấu Ăn Ngon",
    image: require("../../../assets/655428.jpg"),
    memberCount: "2 triệu",
    commonFriends: {
      count: 14,
      avatars: [
        require("../../../assets/khi.png"),
        require("../../../assets/khi.png"),
      ],
    },
  },
  {
    id: "7",
    title: "Dạy Nấu Ăn Ngon",
    image: require("../../../assets/655428.jpg"),
    memberCount: "2 triệu",
    commonFriends: {
      count: 14,
      avatars: [
        require("../../../assets/khi.png"),
        require("../../../assets/khi.png"),
      ],
    },
  },
];

// Component con cho một card gợi ý nhóm
const GroupSuggestionCard = ({ group }: { group: GroupSuggestionType }) => (
  <View className="w-[48%] mb-4 bg-white rounded-lg border border-gray-200">
    {/* Phần ảnh */}
    <ImageBackground
      source={group.image}
      className="h-28 w-full"
      imageStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
    >
      <TouchableOpacity className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
        <Feather name="x" size={16} color="white" />
      </TouchableOpacity>
    </ImageBackground>

    {/* Phần nội dung */}
    <View className="p-3">
      <Text className="font-bold text-sm leading-5" numberOfLines={2}>
        {group.title}
      </Text>
      <Text className="text-xs text-gray-500 mt-1">
        Nhóm Công khai · {group.memberCount} thành viên
      </Text>

      {/* Bạn chung */}
      <View className="flex-row items-center mt-2">
        <View className="flex-row">
          {group.commonFriends.avatars.map((avatar, index) => (
            <Image
              key={index}
              source={avatar}
              className={`w-5 h-5 rounded-full border-2 border-white ${
                index > 0 ? "-ml-2" : ""
              }`}
            />
          ))}
        </View>
        <Text className="text-xs text-gray-500 ml-2 flex-1">
          {group.commonFriends.avatars[0] ? "Le Duc Quy" : "Thanh Thảo"} và{" "}
          {group.commonFriends.count} người bạn...
        </Text>
      </View>

      {/* Nút tham gia */}
      <TouchableOpacity className="bg-blue-100 mt-3 py-2 rounded-md">
        <Text className="text-blue-600 font-semibold text-center text-sm">
          Tham gia
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function DiscoverTab() {
  return (
    <ScrollView className="flex-1 bg-gray-50 mb-10">
      <View className="p-4">
        <Text className="text-lg font-bold mb-3">Gợi ý cho bạn</Text>
        <View className="flex-row flex-wrap justify-between">
          {suggestedGroups.map((group) => (
            <GroupSuggestionCard key={group.id} group={group} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
