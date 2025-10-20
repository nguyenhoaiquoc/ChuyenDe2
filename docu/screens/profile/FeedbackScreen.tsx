// screens/Feedback.tsx - Cập nhật: Thêm "Đã đánh giá" ở cuối mỗi review (sau thời gian).
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

const reviews = [
  {
    id: "1",
    userAvatar: require("../../assets/meo.jpg"),
    userName: "Nguyễn Văn A",
    rating: 5,
    comment: "Sản phẩm tuyệt vời, giao hàng nhanh chóng!",
    time: "2 ngày trước",
  },
  {
    id: "2",
    userAvatar: require("../../assets/meo.jpg"),
    userName: "Trần Thị B",
    rating: 4,
    comment: "Chất lượng tốt, nhưng đóng gói hơi lỏng lẻo.",
    time: "1 tuần trước",
  },
  {
    id: "3",
    userAvatar: require("../../assets/meo.jpg"),
    userName: "Lê Văn C",
    rating: 3,
    comment: "Sản phẩm ổn, nhưng giá hơi cao so với chất lượng.",
    time: "3 tuần trước",
  },
];

export default function FeedbackScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<"seller" | "buyer">("seller");

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderReview = ({ item }: { item: any }) => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Image
          source={item.userAvatar}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#1f2937" }}>
            {item.userName}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 2 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Ionicons
                key={index}
                name={index < item.rating ? "star" : "star-outline"}
                size={16}
                color="#fbbf24"
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={{ fontSize: 14, color: "#6b7280", lineHeight: 20 }}>
        {item.comment}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>{item.time}</Text>
        <Text style={{ fontSize: 16, color: "#6b7280" }}>Đã đánh giá</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ alignItems: "center", paddingVertical: 40 }}>
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            backgroundColor: "#fef3c7",
            borderRadius: 16,
            padding: 20,
            marginBottom: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Ionicons name="star-outline" size={32} color="#f59e0b" />
        </View>
        <View
          style={{
            backgroundColor: "#fef3c7",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
            maxWidth: 250,
          }}
        >
          <Text style={{ fontSize: 13, color: "#92400e", textAlign: "center" }}>
            Hãy mua bán trên TDC để đánh giá! Bạn chưa có lượt đánh giá nào
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <StatusBar barStyle="dark-content" />
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          backgroundColor: "white",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1f2937" }}>
          Chờ đánh giá
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 8,
          backgroundColor: "white",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: "#6b7280",
            alignSelf: "flex-end",
            textDecorationLine: "underline",
          }}
        >
          Đánh giá từ tôi
        </Text>
      </View>
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          justifyContent: "flex-end",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab("seller")}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: activeTab === "seller" ? "#3b82f6" : "#6b7280",
              fontWeight: activeTab === "seller" ? "600" : "normal",
            }}
          >
            Người bán (0)
          </Text>
          {activeTab === "seller" && (
            <View
              style={{
                height: 2,
                backgroundColor: "#3b82f6",
                width: "100%",
                marginTop: 4,
              }}
            />
          )}
        </TouchableOpacity>
        <View
          style={{
            width: 1,
            backgroundColor: "#e5e7eb",
            height: 20,
            marginHorizontal: 8,
          }}
        />
        <TouchableOpacity
          onPress={() => setActiveTab("buyer")}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: activeTab === "buyer" ? "#3b82f6" : "#6b7280",
              fontWeight: activeTab === "buyer" ? "600" : "normal",
            }}
          >
            Người mua (0)
          </Text>
          {activeTab === "buyer" && (
            <View
              style={{
                height: 2,
                backgroundColor: "#3b82f6",
                width: "100%",
                marginTop: 4,
              }}
            />
          )}
        </TouchableOpacity>
      </View>
      <FlatList
        data={activeTab === "buyer" ? reviews : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={renderReview}
        ListEmptyComponent={renderEmptyState}
      />
      <Menu />
    </SafeAreaView>
  );
}
