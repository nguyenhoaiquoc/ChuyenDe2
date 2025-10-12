import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { GroupType, RootStackParamList } from "../../../types";

const groups = [
  {
    id: 1,
    name: "Hội những người yêu chó",
    members: "72.203 thành viên",
    posts: "12 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
  {
    id: 2,
    name: "Hội những người nuôi mèo",
    members: "58.441 thành viên",
    posts: "8 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
  {
    id: 3,
    name: "Hội thú cưng dễ thương",
    members: "40.310 thành viên",
    posts: "5 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
  {
    id: 4,
    name: "Hội chim cảnh",
    members: "21.332 thành viên",
    posts: "4 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
  {
    id: 5,
    name: "Cộng đồng yêu động vật Việt Nam",
    members: "18.202 thành viên",
    posts: "9 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
  {
    id: 6,
    name: "Hội những người yêu chó",
    members: "72.203 thành viên",
    posts: "12 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
  {
    id: 7,
    name: "Hội những người nuôi mèo",
    members: "58.441 thành viên",
    posts: "8 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
  {
    id: 8,
    name: "Hội thú cưng dễ thương",
    members: "40.310 thành viên",
    posts: "5 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
  {
    id: 9,
    name: "Hội chim cảnh",
    members: "21.332 thành viên",
    posts: "4 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
  {
    id: 10,
    name: "Cộng đồng yêu động vật Việt Nam",
    members: "18.202 thành viên",
    posts: "9 bài viết mới hôm nay",
    image: require("../../../assets/khi.png"),
  },
];

type YourGroupsTabProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function YourGroupsTab({ navigation }: YourGroupsTabProps) {
  // 4. State để lưu nội dung tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  // 5. Lọc danh sách nhóm dựa trên searchQuery
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groups;
    }
    return groups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [groups, searchQuery]);
  return (
    <ScrollView
      className="flex-1 px-4 pb-24"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-lg font-bold my-4">Tất cả nhóm của bạn</Text>

      {/* Thanh tìm kiếm */}
      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 mb-4">
        <Feather name="search" size={20} color="gray" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm tên nhóm"
          className="flex-1 h-10 ml-2 text-sm"
        />
      </View>

      {/* Hiển thị danh sách nhóm đã lọc */}
      {filteredGroups.length > 0 ? (
        <>
          {filteredGroups.map((g) => (
            <TouchableOpacity
              key={g.id}
              className="flex-row items-center mb-4 p-2 bg-gray-50 rounded-lg"
              onPress={() =>
                navigation.navigate("GroupDetailScreen", { group: g })
              }
            >
              <Image source={g.image} className="w-14 h-14 rounded-lg" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-base">{g.name}</Text>
                <Text className="text-gray-500 text-sm">{g.members}</Text>
                <Text className="text-green-300 text-xs font-medium">
                  {g.posts}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <View className="items-center py-20">
            <Text className="text-gray-500">
              Nhóm của bạn đã hết, hãy gia nhập thêm nhóm!
            </Text>
          </View>
        </>
      ) : (
        // Hiển thị thông báo khi không có kết quả
        <Text className="text-center text-gray-500 mt-8">
          Không tìm thấy nhóm nào phù hợp.
        </Text>
      )}
    </ScrollView>
  );
}
