import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, "AllCategories">;
};

const categories = [
    { id: "1", name: "Tài liệu" },
    { id: "2", name: "Đồng phục" },
    { id: "3", name: "Giày dép" },
    { id: "4", name: "Đồ điện tử" },
    { id: "5", name: "Thú cưng" },
    { id: "6", name: "Tài liệu khoa" },
    // thêm nữa nếu cần
];

export default function AllCategoriesScreen({ navigation }: Props) {
    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 bg-white shadow">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Feather name="arrow-left" size={22} color="#333" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-800 ml-2">
                    Tất cả danh mục
                </Text>
            </View>

            {/* Thanh tìm kiếm */}
            <View className="px-4 mt-3">
                <TextInput
                    placeholder="Tìm kiếm danh mục..."
                    className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700"
                />
            </View>

            {/* Danh sách danh mục */}
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 12 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => console.log("Chọn:", item.name)}
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between px-5 py-4 mb-2 bg-white rounded-lg shadow-sm border border-gray-100"
                    >
                        <Text
                            className="flex-1 text-base text-gray-800"
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>
                        <Feather name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
