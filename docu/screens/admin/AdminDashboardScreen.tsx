import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import "../../global.css";

// --- TYPE DEFINITIONS ---
interface SystemStatus {
  socket: "running" | "disconnected";
  api: "online" | "offline";
  dbPing: number;
  requests24h: number;
  errors500: number;
}

interface Activity {
  id: string;
  type: "user_new" | "user_lock" | "post_new" | "report_new" | "post_removed";
  content: string;
  time: string;
}

interface TopUser {
  id: string;
  name: string;
  posts: number;
  avatar: string; // color hex or url
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- MOCK DATA STATE ---
  const [kpi, setKpi] = useState({
    totalUsers: 1250,
    newUsersToday: 12,
    newPostsToday: 45,
    pendingPosts: 15, // Công khai + Nhóm
    reportsWeek: 8,
    resolveRate: 85, // %
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    socket: "running",
    api: "online",
    dbPing: 45,
    requests24h: 15420,
    errors500: 2,
  });

  const [activities, setActivities] = useState<Activity[]>([
    { id: "1", type: "user_new", content: "Nguyễn Văn A vừa đăng ký", time: "2 phút trước" },
    { id: "2", type: "post_new", content: "Bài đăng #332 cần duyệt", time: "15 phút trước" },
    { id: "3", type: "report_new", content: "Báo cáo vi phạm từ User B", time: "1 giờ trước" },
    { id: "4", type: "user_lock", content: "Admin đã khóa TK Tran C", time: "3 giờ trước" },
  ]);

  const [topUsers, setTopUsers] = useState<TopUser[]>([
    { id: "1", name: "Thanh Hằng", posts: 54, avatar: "bg-pink-400" },
    { id: "2", name: "Quốc Bảo", posts: 42, avatar: "bg-blue-500" },
    { id: "3", name: "Minh Tuấn", posts: 38, avatar: "bg-green-500" },
  ]);

  // --- ACTIONS ---
  const fetchDashboardData = async () => {
    // Giả lập call API
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Tại đây bạn sẽ set dữ liệu thật từ Backend
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  // --- SUB-COMPONENTS (Giao diện con) ---

  // 1. Thẻ KPI nhỏ
  const KpiItem = ({ label, value, subValue, icon, color, bg }: any) => (
    <View className="w-[48%] bg-white p-3 rounded-2xl mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-gray-500 text-[10px] uppercase font-bold">{label}</Text>
          <Text className={`text-xl font-extrabold mt-1 ${color}`}>{value}</Text>
          {subValue && <Text className="text-gray-400 text-[10px] mt-1">{subValue}</Text>}
        </View>
        <View className={`p-2 rounded-full ${bg}`}>{icon}</View>
      </View>
    </View>
  );

  // 2. Biểu đồ cột đơn giản (CSS)
  const SimpleBarChart = () => (
    <View className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
      <Text className="font-bold text-gray-700 mb-4">Thống kê bài đăng (7 ngày)</Text>
      <View className="flex-row justify-between items-end h-32 border-b border-gray-100 pb-2">
        {[20, 45, 30, 60, 80, 50, 75].map((h, index) => (
          <View key={index} className="items-center space-y-1">
            <View style={{ height: h, width: 8 }} className="bg-indigo-500 rounded-t-full" />
            <Text className="text-[10px] text-gray-400">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // 3. Danh mục phân bổ (Thay cho Pie Chart - Trực quan hơn trên mobile)
  const CategoryDistribution = () => (
    <View className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
      <Text className="font-bold text-gray-700 mb-3">Tỷ lệ bài đăng theo danh mục</Text>
      <View className="space-y-3">
        {/* Item 1 */}
        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-gray-600">Đồ điện tử</Text>
            <Text className="text-xs font-bold text-gray-800">45%</Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View className="h-full bg-blue-500 w-[45%]" />
          </View>
        </View>
        {/* Item 2 */}
        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-gray-600">Giáo trình / Sách</Text>
            <Text className="text-xs font-bold text-gray-800">30%</Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View className="h-full bg-orange-500 w-[30%]" />
          </View>
        </View>
        {/* Item 3 */}
        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-gray-600">Đồ gia dụng</Text>
            <Text className="text-xs font-bold text-gray-800">25%</Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View className="h-full bg-green-500 w-[25%]" />
          </View>
        </View>
      </View>
    </View>
  );

  // 4. Quick Action Button
  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className="items-center justify-center w-[30%] mb-4"
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${color} mb-2 shadow-sm`}>
        {icon}
      </View>
      <Text className="text-xs text-center font-medium text-gray-700">{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center sticky top-0 z-10">
        <View>
          <Text className="text-xl font-extrabold text-indigo-800">Dashboard</Text>
          <Text className="text-xs text-gray-500">Chào Admin, chúc một ngày tốt lành!</Text>
        </View>
        <TouchableOpacity onPress={() => {setLoading(true); fetchDashboardData();}} className="bg-gray-100 p-2 rounded-full">
          <Ionicons name="reload" size={20} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4f46e5"]} />}
      >
        
        {/* --- 1. KPIs SECTION --- */}
        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Tổng quan (KPIs)</Text>
        <View className="flex-row flex-wrap justify-between">
          <KpiItem 
            label="Người dùng" 
            value={kpi.totalUsers} 
            subValue={`+${kpi.newUsersToday} hôm nay`}
            color="text-blue-600" bg="bg-blue-50"
            icon={<FontAwesome5 name="users" size={16} color="#2563eb" />}
          />
          <KpiItem 
            label="Tin chờ duyệt" 
            value={kpi.pendingPosts} 
            subValue="Công khai & Nhóm"
            color="text-orange-600" bg="bg-orange-50"
            icon={<MaterialIcons name="pending-actions" size={20} color="#ea580c" />}
          />
          <KpiItem 
            label="Tin đăng mới" 
            value={kpi.newPostsToday} 
            subValue="Hôm nay"
            color="text-indigo-600" bg="bg-indigo-50"
            icon={<Feather name="activity" size={18} color="#4f46e5" />}
          />
           <KpiItem 
            label="Báo cáo tuần" 
            value={kpi.reportsWeek} 
            subValue={`Xử lý: ${kpi.resolveRate}%`}
            color="text-red-600" bg="bg-red-50"
            icon={<MaterialIcons name="report-problem" size={18} color="#dc2626" />}
          />
        </View>

        {/* --- 6. QUICK ACTIONS (Đẩy lên để tiện thao tác) --- */}
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
              icon={<Ionicons name="checkmark-done-circle" size={22} color="#ea580c" />}
              onPress={() => (navigation as any).navigate("ManageProductsUserScreen")}
            />
             <QuickAction 
              title="Tin Nhóm" 
              color="bg-blue-100" 
              icon={<Ionicons name="file-tray-stacked" size={22} color="#2563eb" />}
              onPress={() => (navigation as any).navigate("ManageGroupPostsScreen")}
            />
            <QuickAction 
              title="Báo Cáo" 
              color="bg-yellow-100" 
              icon={<Ionicons name="flag" size={22} color="#ca8a04" />}
              onPress={() => console.log("WIP")} // Chưa có màn hình
            />
            <QuickAction 
              title="Danh Mục" 
              color="bg-teal-100" 
              icon={<Ionicons name="list" size={22} color="#0d9488" />}
              onPress={() => (navigation as any).navigate("ManageCategoriesScreen")}
            />
             <QuickAction 
              title="Cài đặt" 
              color="bg-gray-100" 
              icon={<Ionicons name="settings" size={22} color="#4b5563" />}
              onPress={() => console.log("Settings")}
            />
          </View>
        </View>

        {/* --- 2. CHARTS SECTION --- */}
        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Thống kê & Phân tích</Text>
        <SimpleBarChart />
        <CategoryDistribution />

        {/* --- 5. SYSTEM STATUS --- */}
        <View className="bg-slate-800 p-4 rounded-2xl mb-5 shadow-lg">
          <View className="flex-row items-center mb-3">
            <Feather name="server" size={18} color="#fff" />
            <Text className="text-white font-bold ml-2">Trạng thái hệ thống</Text>
          </View>
          <View className="space-y-2">
            {/* Socket */}
            <View className="flex-row justify-between">
              <Text className="text-gray-400 text-xs">Socket Server</Text>
              <Text className={systemStatus.socket === "running" ? "text-green-400 font-bold text-xs" : "text-red-400 font-bold text-xs"}>
                {systemStatus.socket === "running" ? "● Running" : "● Disconnected"}
              </Text>
            </View>
            {/* API */}
            <View className="flex-row justify-between">
              <Text className="text-gray-400 text-xs">API Server</Text>
              <Text className="text-green-400 font-bold text-xs">● Online</Text>
            </View>
             {/* DB Ping */}
             <View className="flex-row justify-between">
              <Text className="text-gray-400 text-xs">Database Latency</Text>
              <Text className="text-yellow-400 font-bold text-xs">{systemStatus.dbPing}ms</Text>
            </View>
             {/* Errors */}
             <View className="flex-row justify-between border-t border-gray-600 pt-2 mt-1">
              <Text className="text-gray-400 text-xs">Requests (24h)</Text>
              <Text className="text-white font-bold text-xs">{systemStatus.requests24h.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* --- 3. RECENT ACTIVITIES --- */}
        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Hoạt động gần đây</Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-5 border border-gray-100">
          {activities.map((item, index) => (
            <View key={item.id} className={`flex-row items-center py-3 ${index !== activities.length -1 ? 'border-b border-gray-100' : ''}`}>
              <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 
                ${item.type === 'user_new' ? 'bg-green-100' : 
                  item.type === 'report_new' ? 'bg-red-100' : 
                  item.type === 'user_lock' ? 'bg-gray-200' : 'bg-blue-100'}`}>
                 
                 {item.type === 'user_new' && <Ionicons name="person-add" size={14} color="green" />}
                 {item.type === 'report_new' && <Ionicons name="warning" size={14} color="red" />}
                 {item.type === 'user_lock' && <Ionicons name="lock-closed" size={14} color="gray" />}
                 {item.type === 'post_new' && <Ionicons name="newspaper" size={14} color="blue" />}
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-800 font-medium">{item.content}</Text>
                <Text className="text-xs text-gray-400">{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* --- 4. TOP RANKING --- */}
        <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Top Users Năng Nổ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10">
          {topUsers.map((user) => (
            <View key={user.id} className="bg-white p-3 rounded-2xl mr-3 items-center shadow-sm border border-gray-100 w-28">
              <View className={`w-12 h-12 rounded-full mb-2 ${user.avatar}`} />
              <Text className="font-bold text-xs text-gray-700 text-center mb-1">{user.name}</Text>
              <View className="bg-indigo-100 px-2 py-1 rounded-md">
                 <Text className="text-[10px] text-indigo-700 font-bold">{user.posts} bài</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        
        <View className="h-5" />
      </ScrollView>
    </SafeAreaView>
  );
}