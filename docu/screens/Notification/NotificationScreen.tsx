import React, { useState, useEffect , useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Image,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import "../../global.css";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Notification, Product } from "../../types"; // 👈 Nhớ import Product
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
    navigation: NativeStackNavigationProp<
        RootStackParamList,
        "NotificationScreen"
    >;
};

const filters = ["Tài khoản", "Giao dịch", "Tin đăng", "Sự kiện"];

export default function NotificationScreen({ navigation }: Props) {
    const [activeTab, setActiveTab] = useState("Hoạt động");

    //  STATE MỚI ĐỂ LƯU DATA VÀ LOADING
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);  

    //  USEEFFECT ĐỂ GỌI API (Code của ông)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const userId = await AsyncStorage.getItem("userId");
                if (!userId) {
                    Alert.alert("Lỗi", "Không tìm thấy người dùng. Vui lòng đăng nhập lại.");
                    setIsLoading(false);
                    navigation.goBack();
                    return;
                }

                let tabQueryParam = '';
                if (activeTab === 'Tin tức') {
                    tabQueryParam = '?tab=news';
                }

                const apiUrl = `${path}/notifications/user/${userId}${tabQueryParam}`;
                console.log("Calling API:", apiUrl);

                const response = await axios.get(apiUrl);
                setNotifications(response.data);

                // ⛔️ LỖI CŨ: Ông setNotifications 2 lần
                // setNotifications(response.data); // 👈 Xóa dòng này đi

            } catch (error: any) {
                console.error("Lỗi khi tải thông báo:", error.message);
                Alert.alert("Lỗi", "Không thể tải danh sách thông báo.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [activeTab]);

    //  HÀM XỬ LÝ KHI BẤM 
    // ✅ HÀM XỬ LÝ KHI BẤM (Full code)
    const handleNotificationPress = async (item: Notification) => {
        if (isNavigating) return; // Chặn bấm đúp
        setIsNavigating(true);

        const userId = await AsyncStorage.getItem("userId");

        try {
            // 1. Đánh dấu là đã đọc (gọi API PATCH)
            if (!item.is_read && userId) { // Thêm kiểm tra userId
                await axios.patch(`${path}/notifications/${item.id}/read/user/${userId}`);
                // Cập nhật UI ngay lập tức
                setNotifications(prev =>
                    prev.map(n => n.id === item.id ? { ...n, is_read: true } : n)
                );
            }

            // 2. Xử lý điều hướng (chuyển trang)
            if (item.targetType?.name === 'product' && item.product?.id) {

                console.log(`Đang tải chi tiết sản phẩm ${item.product.id}...`);

                // Gọi API lấy chi tiết sản phẩm ĐẦY ĐỦ (raw object)
                const response = await axios.get(`${path}/products/${item.product.id}`);
                const rawProduct = response.data; // Đây là object thô từ API
                const fullProductData: Product = {
                    ...rawProduct, 
                    authorName: rawProduct.user?.fullName || rawProduct.user?.name || "Ẩn danh",
                    price: rawProduct.price ? `${Number(rawProduct.price).toLocaleString("vi-VN")} đ` : "Liên hệ",
                };

                navigation.navigate('ProductDetail', { product: fullProductData });
            }

        } catch (error: any) {
            console.error("Lỗi khi xử lý thông báo:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Không thể mở mục này.");
        } finally {
            setIsNavigating(false); // Mở lại nút
        }
    };

    //  HÀM : XỬ LÝ XÓA TẤT CẢ
    const handleDeleteAll = async () => {
        // 1. Lấy userId
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
            return Alert.alert("Lỗi", "Không tìm thấy người dùng.");
        }

        try {
            // 2. Gọi API DELETE (endpoint ông vừa tạo)
            await axios.delete(
                `${path}/notifications/user/${userId}`
            );

            // 3. Xóa thành công, cập nhật UI
            setNotifications([]); // Set list rỗng

        } catch (error: any) {
            console.error("Lỗi khi xóa thông báo:", error.response?.data || error.message);
            Alert.alert("Lỗi", "Không thể xóa thông báo.");
        }
    };

    //  HÀM  HIỆN CẢNH BÁO XÁC NHẬN
    const showConfirmDeleteAlert = () => {
        Alert.alert(
            "Xóa tất cả thông báo?",
            "Hành động này không thể hoàn tác.",
            [
                {
                    text: "Hủy",
                    style: "cancel",
                },
                {
                    text: "Xóa",
                    onPress: handleDeleteAll,
                    style: "destructive",
                },
            ]
        );
    };

    //  HÀM RENDER ITEM 
    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const formatMessage = (item: Notification) => {
            const actorName = <Text className="font-bold">{item.actor?.fullName || 'Một người'}</Text>;
            const productName = <Text className="font-bold">{item.product?.name || "bài đăng"}</Text>;

            switch (item.action?.name) {
                case 'post_success':
                    return <Text>Bạn đã đăng thành công {productName}.</Text>;
                case 'admin_new_post':
                    return <Text>{actorName} vừa đăng {productName}.</Text>;
                case 'favorite_product':
                    return <Text>{actorName} đã thích {productName} của bạn.</Text>;
                case 'favorite_confirmation':
                    return <Text>Bạn đã thích {productName}.</Text>;
                default:
                    return <Text>{actorName} đã có một hoạt động mới.</Text>;
            }
        };

        // Đây là return của renderNotificationItem
        return (
            <TouchableOpacity
                className={`flex-row items-start p-4 border-b border-gray-100 ${!item.is_read ? "bg-blue-50" : "bg-white"
                    }`}
                onPress={() => handleNotificationPress(item)}
                disabled={isNavigating}
            >
                <Image
                    source={{
                        uri: item.actor?.image
                            ? `${path}${item.actor.image}`
                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                    }}
                    className="w-10 h-10 rounded-full"
                />
                <View className="flex-1 ml-3">
                    <Text className="text-sm leading-5">{formatMessage(item)}</Text>
                    <Text className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                </View>
                {!item.is_read && (
                    <View className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2 mt-1" />
                )}
            </TouchableOpacity>
        );
    }; // <-- Kết thúc hàm renderNotificationItem

    return (
        <SafeAreaView className="flex-1 bg-white mt-6">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold">Thông báo</Text>
                <TouchableOpacity onPress={showConfirmDeleteAlert}>
                    <Text className="text-sm text-red-500">Xóa tất cả</Text>
                </TouchableOpacity>

            </View>

            {/* Tab Navigator */}
            <View className="flex-row">
                <TouchableOpacity
                    onPress={() => setActiveTab("Hoạt động")}
                    className={`flex-1 py-3 items-center ${activeTab === "Hoạt động"
                        ? "border-b-2 border-black"
                        : "border-b border-gray-200"
                        }`}
                >
                    <Text
                        className={`font-semibold ${activeTab === "Hoạt động"
                            ? "text-black"
                            : "text-gray-500"
                            }`}
                    >
                        Hoạt động
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab("Tin tức")}
                    className={`flex-1 py-3 items-center ${activeTab === "Tin tức"
                        ? "border-b-2 border-black"
                        : "border-b border-gray-200"
                        }`}
                >
                    <Text
                        className={`font-semibold ${activeTab === "Tin tức"
                            ? "text-black"
                            : "text-gray-500"
                            }`}
                    >
                        Tin tức
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <View className="px-4 pt-4 pb-2 border-b border-gray-100">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full mr-2 border border-gray-200">
                        <Ionicons name="filter" size={16} color="#333" />
                        <Text className="ml-1 text-sm text-gray-800">Lọc</Text>
                    </TouchableOpacity>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 border border-gray-200"
                        >
                            <Text className="text-sm text-gray-800">{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Nội dung thông báo */}
            <View className="flex-1">
                {isLoading ? (
                    <View className="flex-1 items-center justify-center bg-gray-50/50">
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : notifications.length === 0 ? (
                    <View className="flex-1 items-center justify-center bg-gray-50/50">
                        <Text className="text-gray-500">
                            Hiện tại bạn chưa có thông báo nào
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        renderItem={renderNotificationItem}
                        keyExtractor={(item) => item.id.toString()}
                        className="bg-white"
                    />
                )}
            </View>

            {/* Menu dưới cùng */}
            <Menu />
        </SafeAreaView>
    );

} // 👈 Dấu "}" cuối cùng của component