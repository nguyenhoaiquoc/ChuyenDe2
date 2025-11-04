import { Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import "../../global.css";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { path } from '../../config';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
};

type Message = {
    sender: { name: string; id?: string };
    content: string;
    date: string;
    quanlity: number;
    image: string;
    conversation_id: string;
};

export default function UnreadMessageScreen({ navigation }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    Alert.alert("Lỗi", "Vui lòng đăng nhập.");
                    navigation.replace("LoginScreen");
                    return;
                }

                const response = await axios.get(`${path}/chat/unread`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const rawData = response.data.data || [];

                // Nhóm theo conversation_id
                const grouped = rawData.reduce((acc: any, item: any) => {
                    const convId = item.conversation_id;
                    if (!acc[convId]) {
                        acc[convId] = {
                            conversation_id: convId,
                            sender: item.sender,
                            content: item.content,
                            date: item.created_at,
                            quanlity: 0,
                            image: item.sender.image || "https://via.placeholder.com/46",
                        };
                    }
                    acc[convId].quanlity += 1;
                    if (new Date(item.created_at) > new Date(acc[convId].date)) {
                        acc[convId].content = item.content;
                        acc[convId].date = item.created_at;
                    }
                    return acc;
                }, {});

                const formattedMessages: Message[] = Object.values(grouped).map((item: any) => ({
                    sender: { 
                        name: item.sender.fullName || "Ẩn danh",
                        id: item.sender.id || item.sender_id // fallback nếu có sender_id
                    },
                    content: item.content || "Tin nhắn mới",
                    date: formatDate(item.date),
                    quanlity: item.quanlity,
                    image: item.image,
                    conversation_id: item.conversation_id,
                }));

                setMessages(formattedMessages);
            } catch (error: any) {
                console.log("Lỗi:", error.response?.data || error);
            } finally {
                setLoading(false);
            }
        };

        fetchUnreadMessages();
    }, [navigation]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) return "Hôm nay";

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        return date.getFullYear() === now.getFullYear()
            ? `${day}/${month}`
            : `${day}/${month}/${year}`;
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="mt-3 text-gray-600">Đang tải tin nhắn...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="auto" />

            {/* Header */}
            <View className="flex flex-row justify-between px-5 mt-14 items-center border-b border-gray-200 pb-5">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Feather name="arrow-left" size={22} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Tin chưa đọc</Text>
                <TouchableOpacity onPress={() => navigation.navigate("SearchScreen")}>
                    <FontAwesome5 name="search" size={20} color="gray" />
                </TouchableOpacity>
            </View>

            {/* Danh sách */}
            <View>
                {messages.length === 0 ? (
                    <View className="flex-1 justify-center items-center mt-20 px-10">
                        <Text className="text-lg text-gray-500">Không có tin nhắn chưa đọc.</Text>
                    </View>
                ) : (
                    messages.map((d, i) => (
                        <TouchableOpacity
                            key={i}
                            activeOpacity={0.8}
                            className="flex flex-row py-5 px-4 border-b border-gray-200"
                            onPress={async () => {
                                try {
                                    const [tokenValue, currentUserId, currentUserName] = await Promise.all([
                                        AsyncStorage.getItem("token"),
                                        AsyncStorage.getItem("userId"),
                                        AsyncStorage.getItem("userName"),
                                    ]);

                                    if (!tokenValue || !currentUserId) {
                                        Alert.alert("Thông báo", "Vui lòng đăng nhập lại.");
                                        return;
                                    }

                                    navigation.navigate("ChatRoomScreen", {
                                        roomId: d.conversation_id,
                                        product: undefined,
                                        otherUserId: d.sender.id || "2", // fallback nếu không có id
                                        otherUserName: d.sender.name,
                                        otherUserAvatar: d.image,
                                        currentUserId: Number(currentUserId),
                                        currentUserName: currentUserName || "Tôi",
                                        token: tokenValue,
                                    });
                                } catch (error) {
                                    console.error("Lỗi mở phòng chat:", error);
                                    Alert.alert("Lỗi", "Không thể mở phòng chat!");
                                }
                            }}
                        >
                            <View>
                                <Image
                                    className="w-[46px] h-[46px] rounded-full"
                                    source={{ uri: d.image }}
                                />
                            </View>
                            <View className="w-[88%] pl-2">
                                <View className="flex flex-row justify-between">
                                    <Text className="text-xl font-semibold">{d.sender.name}</Text>
                                    <View className="bg-red-500 px-2.5 rounded-full py-1 justify-center items-center min-w-[20px]">
                                        <Text className="text-white text-xs font-medium">
                                            {d.quanlity > 99 ? "99+" : d.quanlity}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex flex-row justify-between mt-1">
                                    <Text className="text-lg text-gray-500 flex-1 mr-3" numberOfLines={1}>
                                        {d.content}
                                    </Text>
                                    <Text className="text-lg text-gray-500">{d.date}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </View>
    );
}