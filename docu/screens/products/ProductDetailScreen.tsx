import { View, Text, Image, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "../../global.css";
import { useState } from "react";

export default function ProductDetailScreen() {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([
        {
            id: 1,
            name: "Nguyễn hoài quắc",
            image: require("../../assets/khi.png"),
            time: "2 tháng trước",
            content: "Rẻ nhưng máy zin màn zin thì cửa hàng mua có bán kg",
        },
    ]);

    const handleSend = () => {
        if (comment.trim() !== "") {
            const newComment = {
                id: comments.length + 1,
                name: "Bạn",
                image: require("../../assets/khi.png"), 
                time: "Vừa xong",
                content: comment,
            };
            setComments([...comments, newComment]);
            setComment("");
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1">
                {/* Ảnh sản phẩm */}
                <View className="relative">
                    <Image
                        source={require("../../assets/ip12promax.png")}
                        className="w-full h-72"
                        resizeMode="cover"
                    />
                    {/* Nút Lưu */}
                    <TouchableOpacity className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex-row items-center border border-gray-300">
                        <Ionicons name="heart-outline" size={16} color="black" />
                        <Text className="ml-1 text-xs text-black">Lưu </Text>
                    </TouchableOpacity>
                </View>

                <View className="px-4 py-3 pb-12">
                    {/* Tiêu đề */}
                    <Text className="text-base font-semibold">
                        Iphone 12 Promax 128 xanh{"\n"}biên zin đẹp BH dài 6th
                    </Text>

                    {/* Giá */}
                    <Text className="text-red-600 text-xl font-bold mt-2">
                        7.500.000 đ
                    </Text>

                    {/* Địa chỉ */}
                    <Text className="text-gray-500 text-sm mt-1">
                        📍 467 lê quang định, phường 5, Quận bình thạnh, Tp hồ chí minh
                    </Text>
                    <Text className="text-gray-400 text-xs">1 tuần trước</Text>

                    {/* Thông tin shop */}
                    <View className="flex-row items-center mt-4">
                        <Image
                            source={{
                                uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                            }}
                            className="w-12 h-12 rounded-full"
                        />
                        <View className="ml-3 flex-1">
                            <Text className="font-semibold">m im</Text>
                            <Text className="text-gray-500 text-xs">đã bán 1 lần</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-yellow-500 font-bold">4.1 ★</Text>
                            <Text className="ml-1 text-gray-500 text-xs">(14 đánh giá)</Text>
                        </View>
                    </View>

                    {/* Mô tả chi tiết */}
                    <View className="mt-6">
                        <Text className="text-lg font-bold">Mô tả chi tiết</Text>
                        <Text className="text-gray-700 mt-2 leading-6 text-sm">
                            iPhone 12 là bước tiến tiếp theo trong trải nghiệm smartphone...
                        </Text>
                        <View className="flex-row items-center justify-between bg-gray-200 px-4 py-2 rounded-full mt-4">
                            <Text className="text-sm text-gray-700">
                                SĐT liên hệ: <Text className="font-semibold">091506**** </Text>
                            </Text>
                            <TouchableOpacity>
                                <Text className="text-sm font-semibold text-blue-500">Gọi ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Thông tin chi tiết */}
                <View className="mt-6">
                    <Text className="text-lg font-bold mb-2">Thông tin chi tiết</Text>
                    <View className="border border-gray-200 rounded-lg">
                        {/* Hãng */}
                        <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                            <Text className="text-gray-600 text-sm">Hãng</Text>
                            <Text className="text-gray-800 text-sm font-medium">Apple</Text>
                        </View>
                        {/* Dòng máy */}
                        <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                            <Text className="text-gray-600 text-sm">Dòng máy</Text>
                            <Text className="text-gray-800 text-sm font-medium">iPhone 12 ProMax</Text>
                        </View>
                        {/* Tình trạng */}
                        <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                            <Text className="text-gray-600 text-sm">Tình trạng</Text>
                            <Text className="text-gray-800 text-sm font-medium">
                                Đã sử dụng (chưa sửa chữa)
                            </Text>
                        </View>
                        {/* Màu sắc */}
                        <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                            <Text className="text-gray-600 text-sm">Màu sắc</Text>
                            <Text className="text-gray-800 text-sm font-medium">Xanh dương</Text>
                        </View>
                        {/* Dung lượng */}
                        <View className="flex-row justify-between px-3 py-2 border-b border-gray-200">
                            <Text className="text-gray-600 text-sm">Dung lượng</Text>
                            <Text className="text-gray-800 text-sm font-medium">128GB</Text>
                        </View>
                        {/* Xuất xứ */}
                        <View className="flex-row justify-between px-3 py-2">
                            <Text className="text-gray-600 text-sm">Xuất xứ</Text>
                            <Text className="text-gray-800 text-sm font-medium">Mỹ</Text>
                        </View>
                        <View className="flex-row justify-between px-3 py-2">
                            <Text className="text-gray-600 text-sm">Phiên bản</Text>
                            <Text className="text-gray-800 text-sm font-medium">Quốc tế</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between bg-gray-200 px-4 py-2 rounded-full mt-4">
                        <Text className="text-sm text-gray-700">Bạn có sản phẩm tương tự</Text>
                        <TouchableOpacity className="bg-black px-4 py-1 rounded-full">
                            <Text className="text-white text-sm font-semibold">Đăng bán</Text>
                        </TouchableOpacity>
                    </View>
                </View>
      

                {/* Bình luận */ }
    <View className="mt-8 mb-6">
        <Text className="text-lg font-bold mb-3">Bình luận</Text>
        {comments.map((c) => (
            <View key={c.id} className="flex-row items-start mb-4">
                <Image
                    source={c.image}
                    className="w-10 h-10 rounded-full"
                />
                <View className="ml-3 flex-1 bg-gray-100 px-3 py-2 rounded-2xl">
                    <Text className="font-semibold text-sm">{c.name}</Text>
                    <Text className="text-gray-600 text-sm mt-1">{c.content}</Text>
                    <Text className="text-gray-400 text-xs mt-1">{c.time}</Text>
                </View>
            </View>
        ))}

        {/* Ô nhập + nút gửi (cuộn xuống mới thấy) */}
        <View className="flex-row items-center border border-gray-300 rounded-full px-3 py-2 bg-white mt-2">
            <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Bình luận..."
                className="flex-1 px-2 text-sm"
            />
            <TouchableOpacity
                onPress={handleSend}
                className="ml-2 bg-blue-500 px-4 py-2 rounded-full"
            >
                <Text className="text-white font-semibold text-sm">Gửi</Text>
            </TouchableOpacity>
        </View>
    </View>
        </View >
            </ScrollView >
        </View >
    );
}
