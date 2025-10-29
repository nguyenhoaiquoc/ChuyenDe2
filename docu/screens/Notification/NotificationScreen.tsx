import React, { useState, useEffect } from "react";
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
import { RootStackParamList, Notification } from "../../types";
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

    //  STATE MỚI ĐỂ LƯU DATA VÀ LOADING
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    //  USEEFFECT ĐỂ GỌI API
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                // 1. Lấy userId (giống như ông làm ở các màn hình khác)
                const userId = await AsyncStorage.getItem("userId");
                if (!userId) {
                    Alert.alert("Lỗi", "Không tìm thấy người dùng. Vui lòng đăng nhập lại.");
                    setIsLoading(false);
                    navigation.goBack();
                    return;
                }

                // 👇 Xác định tham số 'tab' dựa trên state 'activeTab'
                let tabQueryParam = '';
                if (activeTab === 'Tin tức') {
                    tabQueryParam = '?tab=news';
                } else {
                    // Mặc định là 'Hoạt động' (hoặc có thể thêm ?tab=activity)
                    // tabQueryParam = '?tab=activity'; 
                }

                // 👇 Gọi API với tham số 'tab'
                const apiUrl = `${path}/notifications/user/${userId}${tabQueryParam}`;
                console.log("Calling API:", apiUrl); // Log để kiểm tra

                const response = await axios.get(apiUrl);
                setNotifications(response.data);

                // 3. Lưu data vào state
                setNotifications(response.data);

            } catch (error: any) {
                console.error("Lỗi khi tải thông báo:", error.message);
                Alert.alert("Lỗi", "Không thể tải danh sách thông báo.");
            } finally {
                setIsLoading(false);
            }
        };

        // Chạy khi màn hình được mở
        fetchNotifications();

        // Hoặc chạy khi tab "Hoạt động" được chọn
        // (Ông có thể thêm logic này nếu tab "Tin tức" gọi API khác)
    }, [activeTab]); // Chạy lại nếu đổi tab

    //  HÀM ĐỂ HIỂN THỊ TỪNG MỤC THÔNG BÁO
    const renderNotificationItem = ({ item }: { item: Notification }) => {

        // Hàm dịch thông báo cho đẹp
        const formatMessage = (item: Notification) => {
            const actorName = <Text className="font-bold">{item.actor.fullName}</Text>;
            const productName = <Text className="font-bold">{item.product?.name || "một sản phẩm"}</Text>;

            switch (item.action.name) {
                case 'post_success':
                    return <Text>Bạn đã đăng thành công {productName}.</Text>;
                case 'admin_new_post':
                    return <Text>{actorName} vừa đăng {productName}.</Text>;
                // Thêm các case khác (comment, follow,...) ở đây
                default:
                    return <Text>{actorName} đã có một hoạt động mới.</Text>;
            }
        };

        return (
            <TouchableOpacity
                className={`flex-row items-start p-4 border-b border-gray-100 ${!item.is_read ? "bg-blue-50" : "bg-white" // Đánh dấu chưa đọc
                    }`}
                onPress={() => {
                    // TODO: Đánh dấu đã đọc
                    // this.notificationService.markAsRead(item.id, userId)

                    // Chuyển đến sản phẩm nếu có
                    if (item.product) {
                        //  'item.product' có thể không đủ data cho
                        // màn hình ProductDetail. Ông có thể cần fetch lại product.
                        // Tạm thời cứ log ra xem sao
                        console.log("Chuyển đến sản phẩm:", item.product.id);
                        // navigation.navigate("ProductDetail", { product: item.product });
                    }
                }}
            >
                {/* Avatar của người gây ra hành động */}
                <Image
                    source={{
                        uri: item.actor.image
                            ? `${path}${item.actor.image}`
                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                    }}
                    className="w-10 h-10 rounded-full"
                />

                {/* Nội dung thông báo */}
                <View className="flex-1 ml-3">
                    <Text className="text-sm leading-5">{formatMessage(item)}</Text>
                    <Text className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                </View>

                {/* Chấm xanh (chưa đọc) */}
                {!item.is_read && (
                    <View className="w-2.5 h-2.5 bg-blue-500 rounded-full ml-2 mt-1" />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white mt-6">
            {/* Header (Giữ nguyên) */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold">Thông báo</Text>
                <View className="w-6" />
            </View>

            {/* Tab Navigator (Giữ nguyên) */}
            <View className="flex-row">
                {/* Tab Hoạt động */}
                <TouchableOpacity
                    onPress={() => setActiveTab("Hoạt động")}
                    className={`flex-1 py-3 items-center ${activeTab === "Hoạt động"
                        ? "border-b-2 border-black" // Active: border đen dày
                        : "border-b border-gray-200" // Inactive: border xám mỏng
                        }`}
                >
                    <Text
                        className={`font-semibold ${activeTab === "Hoạt động"
                            ? "text-black" // Active: chữ đen
                            : "text-gray-500" // Inactive: chữ xám
                            }`}
                    >
                        Hoạt động
                    </Text>
                </TouchableOpacity>

                {/* Tab Tin tức */}
                <TouchableOpacity
                    onPress={() => setActiveTab("Tin tức")}
                    className={`flex-1 py-3 items-center ${activeTab === "Tin tức"
                        ? "border-b-2 border-black" // Active: border đen dày
                        : "border-b border-gray-200" // Inactive: border xám mỏng
                        }`}
                >
                    <Text
                        className={`font-semibold ${activeTab === "Tin tức"
                            ? "text-black" // Active: chữ đen
                            : "text-gray-500" // Inactive: chữ xám
                            }`}
                    >
                        Tin tức
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filter Chips (Giữ nguyên) */}
            {/* Filter Chips (Lọc, Tài khoản, Giao dịch...) */}
            <View className="px-4 pt-4 pb-2 border-b border-gray-100">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {/* Nút Lọc */}
                    <TouchableOpacity className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full mr-2 border border-gray-200">
                        <Ionicons name="filter" size={16} color="#333" />
                        <Text className="ml-1 text-sm text-gray-800">Lọc</Text>
                    </TouchableOpacity>

                    {/* Các chip khác */}
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 border border-gray-200"
                        // TODO: Thêm onPress để xử lý filter nếu cần
                        >
                            <Text className="text-sm text-gray-800">{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* ✅ NỘI DUNG THÔNG BÁO (Đã sửa lại) */}
            <View className="flex-1">
                {isLoading ? (
                    // 1. Hiển thị loading
                    <View className="flex-1 items-center justify-center bg-gray-50/50">
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : notifications.length === 0 ? (
                    // 2. Hiển thị nếu rỗng
                    <View className="flex-1 items-center justify-center bg-gray-50/50">
                        <Text className="text-gray-500">
                            Hiện tại bạn chưa có thông báo nào
                        </Text>
                    </View>
                ) : (
                    // 3. Hiển thị danh sách
                    <FlatList
                        data={notifications}
                        renderItem={renderNotificationItem}
                        keyExtractor={(item) => item.id.toString()}
                        className="bg-white"
                    />
                )}
            </View>

            {/* Menu dưới cùng (Giữ nguyên) */}
            <Menu />
        </SafeAreaView>
    );
}