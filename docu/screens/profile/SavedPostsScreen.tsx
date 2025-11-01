import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Product } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { path } from '../../config';
import ProductCard from '../../components/ProductCard';
import Menu from '../../components/Menu';
import '../../global.css';
import { SafeAreaView } from "react-native-safe-area-context";

type NavProps = NativeStackNavigationProp<RootStackParamList, 'SavedPostsScreen'>;

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) {
        return seconds < 5 ? "vừa xong" : `${seconds} giây trước`;
    }
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    return Math.floor(interval) + " phút trước";
};

const mapProductData = (item: any): Product => {
    const imageUrl = (() => {
        if (!item.thumbnail_url && item.images?.length)
            return item.images[0].image_url;
        const url = item.thumbnail_url || "";
        if (url.startsWith("http")) return url;
        return `${path}${url}`;
    })();

    let locationText = "Chưa rõ địa chỉ";
    if (item.address_json) {
        try {
            const addr =
                typeof item.address_json === "string"
                    ? JSON.parse(item.address_json)
                    : item.address_json;
            if (addr.full) {
                locationText = addr.full;
            } else {
                const parts = [addr.ward, addr.district, addr.province]
                    .filter(Boolean)
                    .slice(-2);
                locationText =
                    parts.length > 0 ? parts.join(", ") : "Chưa rõ địa chỉ";
            }
        } catch (e) {
            locationText = "Chưa rõ địa chỉ";
        }
    }

    const createdAt = item.created_at
        ? new Date(new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000)
        : new Date();
    const timeDisplay = timeSince(createdAt);

    let tagText = "Không có danh mục";
    const categoryName = item.category?.name || null;
    const subCategoryName = item.subCategory?.name || null;
    if (categoryName && subCategoryName) {
        tagText = `${categoryName} - ${subCategoryName}`;
    } else if (categoryName) {
        tagText = categoryName;
    } else if (subCategoryName) {
        tagText = subCategoryName;
    }

    // Trả về object Product (y hệt HomeScreen)
    return {
        id: item.id.toString(),
        image: imageUrl,
        name: item.name || "Không có tiêu đề",
        price: (() => {
            if (item.dealType?.name === "Miễn phí") return "Miễn phí";
            if (item.dealType?.name === "Trao đổi") return "Trao đổi";
            return item.price
                ? `${Number(item.price).toLocaleString("vi-VN")} đ`
                : "Liên hệ";
        })(),
        location: locationText,
        time: timeDisplay,
        tag: tagText,
        authorName: item.user?.fullName || item.user?.name || "Ẩn danh",
        user_id: item.user?.id ?? item.user_id ?? 0,
        category: item.category,
        subCategory: item.subCategory
            ? {
                id: item.subCategory.id
                    ? parseInt(item.subCategory.id)
                    : undefined,
                name: item.subCategory.name,
                source_table: item.subCategory.source_table,
                source_detail: item.subCategory.source_detail,
            }
            : undefined,
        category_change: item.category_change || undefined,
        sub_category_change: item.sub_category_change || undefined,
        imageCount: item.images?.length || (imageUrl ? 1 : 0),

        // ❗️ KHÁC BIỆT: Mọi sản phẩm ở đây ĐỀU LÀ YÊU THÍCH
        isFavorite: true,

        images: item.images || [],
        description: item.description || "",
        postType: item.postType || { id: "1", name: "Chưa rõ" },
        productType: item.productType || { id: "1", name: "Chưa rõ" },
        condition: item.condition || { id: "1", name: "Chưa rõ" },
        dealType: item.dealType || { id: "1", name: "Bán" },
        address_json: item.address_json || { full: locationText },
        phone: item.user?.phone || null,
        author: item.author || null,
        year: item.year || null,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || undefined,
        sub_category_id: item.sub_category_id || null,
        status_id: item.status_id?.toString() || undefined,
        visibility_type: item.visibility_type?.toString() || undefined,
        group_id: item.group_id || null,
        is_approved:
            typeof item.is_approved === "boolean"
                ? item.is_approved
                : undefined,
    } as Product;
};

export default function SavedPostsScreen() {
    const navigation = useNavigation<NavProps>();
    const isFocused = useIsFocused(); // Hook để biết khi nào quay lại màn hình
    const [isLoading, setIsLoading] = useState(true);
    const [savedProducts, setSavedProducts] = useState<Product[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // Hàm load data
    const fetchSavedPosts = async (currentUserId: string) => {
        setIsLoading(true);
        try {
            // Gọi API MỚI mà ông vừa tạo (dùng ?userId=... như đã sửa)
            const response = await axios.get(
                `${path}/favorites/my-list?userId=${currentUserId}`,
            );

            // Backend trả về mảng Product đầy đủ
            // Map lại dữ liệu (giá, ảnh,...) giống như HomeScreen
            const mappedData = response.data.map(mapProductData);
            setSavedProducts(mappedData);

        } catch (error: any) {
            console.error('Lỗi tải tin đã lưu:', error.message);
            Alert.alert('Lỗi', 'Không thể tải danh sách tin đã lưu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Dùng useIsFocused để load lại data mỗi khi quay lại màn hình này
    useEffect(() => {
        const loadData = async () => {
            const id = await AsyncStorage.getItem('userId');
            if (id) {
                setUserId(id);
                if (isFocused) {
                    fetchSavedPosts(id);
                }
            } else {
                // Xử lý nếu không có user
                Alert.alert('Lỗi', 'Không tìm thấy người dùng. Vui lòng đăng nhập.');
                setIsLoading(false);
            }
        }
        loadData();
    }, [isFocused]); // 

    // Hàm Bỏ lưu nhanh
    const handleToggleFavorite = async (productId: string) => {

        // 1. Lấy userId TRỰC TIẾP từ Storage (để đảm bảo luôn có)
        const userIdStr = await AsyncStorage.getItem('userId');
        if (!userIdStr) {
            Alert.alert("Lỗi", "Không tìm thấy người dùng, vui lòng thử lại.");
            return;
        }

        // 2. Cập nhật UI trước (Optimistic Update)
        // Dòng này của ông đã đúng, nó sẽ làm sản phẩm biến mất ngay
        setSavedProducts(prevProducts =>
            prevProducts.filter(product => product.id !== productId)
        );

        try {
            // 3. Gọi API với userId đã lấy được
            // (Backend sẽ xóa 'favorite' VÀ xóa 'thông báo')
            await axios.post(`${path}/favorites/toggle/${productId}?userId=${userIdStr}`);

            // Bỏ lưu thành công, không cần làm gì thêm vì UI đã cập nhật
            console.log(`Đã bỏ lưu sản phẩm ${productId}`);

        } catch (err: any) {
            // 4. NẾU LỖI: Tải lại danh sách (để khôi phục lại cái vừa xóa)
            console.log("Lỗi khi bỏ lưu:", err.response?.data || err.message);

            Alert.alert("Lỗi", "Bỏ lưu thất bại, vui lòng thử lại.");

            // Tải lại danh sách để đồng bộ, vì UI đã lỡ xóa rồi
            if (isFocused) {
                fetchSavedPosts(userIdStr);
            }
        }
    };


    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center mt-6 bg-white">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white mt-6">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold">Tin đăng đã lưu</Text>
                <View className="w-6" />{/* Spacer */}
            </View>

            {/* Danh sách */}
            {savedProducts.length === 0 ? (
                <View className="flex-1 items-center justify-center bg-gray-50/50">
                    <Text className="text-gray-500">Bạn chưa lưu tin đăng nào.</Text>
                </View>
            ) : (
                <FlatList
                    data={savedProducts}
                    numColumns={2} // Hiển thị 2 cột
                    className="p-2 bg-gray-50/50"
                    keyExtractor={(item) => item.id.toString()}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            isFavorite={true} // 👈 Luôn luôn là 'true'
                            onPress={() =>
                                navigation.navigate('ProductDetail', { product: item })
                            }
                            onToggleFavorite={() => handleToggleFavorite(item.id)} // 👈 Bỏ lưu
                            onPressPostType={() => { }}
                        />
                    )}
                />
            )}

            {/* Menu (Sao chép từ HomeScreen) */}
            <Menu />
        </SafeAreaView>
    );
}