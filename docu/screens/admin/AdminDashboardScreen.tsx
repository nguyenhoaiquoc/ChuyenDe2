import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  DimensionValue,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import "../../global.css";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { path } from "../../config";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const DEFAULT_AVATAR = require("../../assets/default.png");

// --- TYPE DEFINITIONS ---
interface TopUser {
  id: string;
  name: string;
  posts: number;
  avatar: string;
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- REAL DATA STATE ---
  const [kpi, setKpi] = useState({
    totalUsers: 0,
    activePosts: 0,
    pendingPosts: 0,
    reportsWeek: 0,
  });

  const [topUsers, setTopUsers] = useState<TopUser[]>([]);

  // Data cho biểu đồ
  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [categoryData, setCategoryData] = useState<
    { name: string; percent: number; color: string }[]
  >([]);

  // --- API ACTIONS ---
  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
        return;
      }

      // Gọi song song các API
      const [usersRes, productsRes, reportsRes] = await Promise.all([
        axios.get(`${path}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${path}/products?view=admin_all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${path}/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const users = usersRes.data;
      const products = productsRes.data;
      console.log(products);

      console.log("Tổng số sản phẩm lấy về:", products.length);
      console.log("Mẫu 1 sản phẩm:", JSON.stringify(products[0], null, 2));

      // Kiểm tra xem có bài nào status 1 trong danh sách thô không
      const checkPend = products.filter(
        (p: any) =>
          p.statusId == 1 || p.status_id == 1 || p.productStatus?.id == 1
      );
      console.log("Tìm thử bài status 1:", checkPend.length);
      const reports = reportsRes.data;

      // 1. TÍNH TOÁN KPI
      const startOfWeek = dayjs().startOf("week");

      // - Users: Lấy roleId = 2 (Sinh viên)
      const studentUsers = users.filter((u: any) => Number(u.roleId) === 2);

      // 🟢 SỬA LẠI: Đếm tất cả sản phẩm có status = 2 (Đang hiển thị)
      const activePostsCount = products.filter(
        (p: any) => p.productStatus?.id === 2 || Number(p.statusId) === 2
      ).length;

      // - Pending Posts
      const pendingPosts = products.filter(
        (p: any) => p.productStatus?.id === 1 || Number(p.statusId) === 1
      ).length;
      console.log("Tin đã duyệt", activePostsCount);
      console.log("Tin cần duyệt", pendingPosts);

      // - Reports
      const reportsThisWeek = reports.filter((r: any) =>
        dayjs(r.createdAt).isAfter(startOfWeek)
      ).length;

      setKpi({
        totalUsers: studentUsers.length,
        activePosts: activePostsCount,
        pendingPosts: pendingPosts,
        reportsWeek: reportsThisWeek,
      });

      // 2. TÍNH TOÁN BIỂU ĐỒ CỘT (7 ngày gần nhất)
      // 2. TÍNH TOÁN BIỂU ĐỒ CỘT (7 ngày gần nhất)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = dayjs().subtract(6 - i, "day");
        return {
          label: d.format("dd"),
          date: d,
          count: 0,
        };
      });

      products.forEach((p: any) => {
        // 🟢 1. THÊM DÒNG NÀY: Chỉ lấy bài đã duyệt (Status 2)
        const isApproved =
          p.productStatus?.id === 2 || Number(p.statusId) === 2;
        if (!isApproved) return; // Nếu không phải bài đã duyệt thì bỏ qua ngay

        // Logic đếm ngày (giữ nguyên)
        const pDate = dayjs(p.createdAt);
        const foundDay = last7Days.find((d) => d.date.isSame(pDate, "day"));

        if (foundDay) {
          foundDay.count++;
        }
      });

      // products.forEach((p: any) => {
      //   const pDate = dayjs(p.createdAt);
      //   const foundDay = last7Days.find((d) => d.date.isSame(pDate, "day"));
      //   if (foundDay) foundDay.count++;
      // });

      // 🟢 THÊM ĐOẠN LOG NÀY ĐỂ IN RA KẾT QUẢ
      console.log("📊 THỐNG KÊ BÀI ĐĂNG 7 NGÀY GẦN NHẤT:");
      last7Days.forEach((day) => {
        console.log(
          `📅 Ngày ${day.date.format("DD/MM/YYYY")}: ${day.count} bài`
        );
      });

      setChartData(last7Days.map((d) => d.count));

      // 4. TÍNH TOP USER
      const userPostCount: Record<
        string,
        { name: string; count: number; avatar: string }
      > = {};
      products.forEach((p: any) => {
        if (p.user) {
          const uid = p.user.id;
          if (!userPostCount[uid]) {
            const fullUser = users.find((u: any) => u.id == uid);

            userPostCount[uid] = {
              name: p.user.name || p.user.email,
              count: 0,
              avatar: fullUser?.image || p.user.image || "",
            };
          }
          userPostCount[uid].count++;
        }
      });
      const sortedTopUsers = Object.entries(userPostCount)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([id, val], index) => ({
          id,
          name: val.name,
          posts: val.count,
          avatar: val.avatar,
        }));
      console.log("🔍 CHECK TOP USERS AVATAR:");
      sortedTopUsers.forEach((u) => {
        console.log(`User: ${u.name} | Avatar Raw: ${u.avatar}`);
      });

      setTopUsers(sortedTopUsers);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  // --- SUB-COMPONENTS ---

  const KpiItem = ({ label, value, subValue, icon, color, bg }: any) => (
    <View className="w-[48%] bg-white p-3 rounded-2xl mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-gray-500 text-[10px] uppercase font-bold">
            {label}
          </Text>
          <Text className={`text-xl font-extrabold mt-1 ${color}`}>
            {value}
          </Text>
          {subValue && (
            <Text className="text-gray-400 text-[10px] mt-1">{subValue}</Text>
          )}
        </View>
        <View className={`p-2 rounded-full ${bg}`}>{icon}</View>
      </View>
    </View>
  );

  // Biểu đồ cột Dynamic (Đã thêm số lượng trên đầu cột)
  const SimpleBarChart = () => {
    const maxVal = Math.max(...chartData, 1); // Tránh chia cho 0
    const days = Array.from({ length: 7 }, (_, i) =>
      dayjs()
        .subtract(6 - i, "day")
        .format("dd")
    );

    return (
      <View className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
        <Text className="font-bold text-gray-700 mb-4">
          Thống kê bài đăng (7 ngày)
        </Text>

        {/* Container chính của các cột */}
        <View className="flex-row justify-between items-end h-40 border-b border-gray-100 pb-2">
          {chartData.map((val, index) => {
            const heightPercent = (val / maxVal) * 100;
            // Giới hạn chiều cao hiển thị tối đa khoảng 70% khung để chừa chỗ cho số
            const safeHeight =
              heightPercent > 0 ? `${heightPercent * 0.7}%` : "5%";

            return (
              <View
                key={index}
                className="items-center flex-1 justify-end h-full"
              >
                {/* 🟢 1. HIỂN THỊ SỐ LƯỢNG (MỚI THÊM) */}
                <Text className="text-xs text-indigo-600 font-bold mb-1">
                  {val > 0 ? val : ""}
                </Text>

                {/* Thanh Bar */}
                <View
                  style={{ height: safeHeight as DimensionValue, width: 8 }}
                  className={`${
                    index === 6 ? "bg-indigo-600" : "bg-indigo-300"
                  } rounded-t-full`}
                />

                {/* Nhãn ngày (T2, T3...) */}
                <Text className="text-[10px] text-gray-400 mt-1">
                  {days[index]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="items-center justify-center w-[30%] mb-4"
    >
      <View
        className={`w-12 h-12 rounded-2xl items-center justify-center ${color} mb-2 shadow-sm`}
      >
        {icon}
      </View>
      <Text className="text-xs text-center font-medium text-gray-700">
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center sticky top-0 z-10">
        <View>
          <Text className="text-xl font-extrabold text-indigo-800">
            Dashboard
          </Text>
          <Text className="text-xs text-gray-500">
            {loading
              ? "Đang cập nhật dữ liệu..."
              : "Dữ liệu cập nhật lúc " + dayjs().format("HH:mm")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            fetchDashboardData();
          }}
          className="bg-gray-100 p-2 rounded-full"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4b5563" />
          ) : (
            <Ionicons name="reload" size={20} color="#4b5563" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
          />
        }
      >
        {/* --- 1. KPIs SECTION --- */}
        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">
          Tổng quan (KPIs)
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <KpiItem
            label="Người dùng"
            value={kpi.totalUsers}
            subValue={null}
            color="text-blue-600"
            bg="bg-blue-50"
            icon={<FontAwesome5 name="users" size={16} color="#2563eb" />}
          />
          <KpiItem
            label="Tin chờ duyệt"
            value={kpi.pendingPosts}
            subValue="Cần xử lý ngay"
            color="text-orange-600"
            bg="bg-orange-50"
            icon={
              <MaterialIcons name="pending-actions" size={20} color="#ea580c" />
            }
          />

          {/* 🟢 ĐÃ SỬA: Label + Value + SubValue */}
          <KpiItem
            label="Tin đang hiển thị"
            value={kpi.activePosts}
            subValue={null}
            color="text-indigo-600"
            bg="bg-indigo-50"
            icon={<Feather name="activity" size={18} color="#4f46e5" />}
          />

          <KpiItem
            label="Báo cáo tuần"
            value={kpi.reportsWeek}
            subValue={null}
            color="text-red-600"
            bg="bg-red-50"
            icon={
              <MaterialIcons name="report-problem" size={18} color="#dc2626" />
            }
          />
        </View>

        {/* --- QUICK ACTIONS --- */}
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-5">
          <Text className="font-bold text-gray-700 mb-4">Truy cập nhanh</Text>
          <View className="flex-row flex-wrap justify-between">
            <QuickAction
              title="QL Users"
              color="bg-red-100"
              icon={<Ionicons name="people" size={22} color="#dc2626" />}
              onPress={() => (navigation as any).navigate("AdminVerification")}
            />
            <QuickAction
              title="Duyệt Tin"
              color="bg-orange-100"
              icon={
                <Ionicons
                  name="checkmark-done-circle"
                  size={22}
                  color="#ea580c"
                />
              }
              onPress={() =>
                (navigation as any).navigate("ManageProductsUserScreen")
              }
            />
            <QuickAction
              title="Tin Nhóm"
              color="bg-blue-100"
              icon={
                <Ionicons name="file-tray-stacked" size={22} color="#2563eb" />
              }
              onPress={() =>
                (navigation as any).navigate("ManageGroupPostsScreen")
              }
            />
            <QuickAction
              title="Báo Cáo"
              color="bg-yellow-100"
              icon={<Ionicons name="flag" size={22} color="#ca8a04" />}
              onPress={() =>
                (navigation as any).navigate("ManageReportsScreen")
              }
            />
            <QuickAction
              title="Danh Mục"
              color="bg-teal-100"
              icon={<Ionicons name="list" size={22} color="#0d9488" />}
              onPress={() =>
                (navigation as any).navigate("ManageCategoriesScreen")
              }
            />
            <QuickAction
              title="Home"
              color="bg-gray-100"
              icon={<Ionicons name="home" size={22} color="#4b5563" />}
              onPress={() => (navigation as any).navigate("HomeAdminScreen")}
            />
          </View>
        </View>

        {/* --- CHARTS SECTION --- */}
        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">
          Thống kê & Phân tích
        </Text>
        <SimpleBarChart />

        {/* --- TOP RANKING --- */}
        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">
          Top Users Năng Nổ
        </Text>
        {topUsers.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-10"
          >
            {topUsers.map((user) => {
              // 🟢 LOGIC MỚI: Xử lý ảnh ngay tại đây
              let imageSource;
              if (user.avatar && user.avatar.trim() !== "") {
                // Nếu có link thì kiểm tra xem có http chưa
                const uri = user.avatar.startsWith("http")
                  ? user.avatar
                  : `${path}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`;
                imageSource = { uri: uri };
              } else {
                // Không có link thì dùng ảnh mặc định
                imageSource = DEFAULT_AVATAR;
              }

              return (
                <View
                  key={user.id}
                  className="bg-white p-3 rounded-2xl mr-3 items-center shadow-sm border border-gray-100 w-28"
                >
                  <View className="w-12 h-12 rounded-full mb-2 bg-gray-200 items-center justify-center overflow-hidden border border-gray-100">
                    {/* Luôn hiển thị Image với source đã xử lý ở trên */}
                    <Image
                      source={imageSource}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>

                  <Text
                    className="font-bold text-xs text-gray-700 text-center mb-1"
                    numberOfLines={1}
                  >
                    {user.name}
                  </Text>
                  <View className="bg-indigo-100 px-2 py-1 rounded-md">
                    <Text className="text-[10px] text-indigo-700 font-bold">
                      {user.posts} bài
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text className="text-gray-400 text-center text-xs italic mb-10">
            Chưa có dữ liệu xếp hạng
          </Text>
        )}

        <View className="h-5" />
      </ScrollView>
    </SafeAreaView>
  );
}
