// screens/ManagerStory.tsx
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

const products = [
  {
    id: "1",
    image: require("../../assets/hoa.png"),
    title: "iPhone 12 promax128 Xanh biển-zin đẹp BH dài 6th",
    price: "7.599.000 đ",
    location: "TP Hồ Chí Minh ",
    time: "3 ngày trước",
    tag: "Điện thoại",
    isFavorite: true,
  },
  {
    id: "2",
    image: require("../../assets/hoa.png"),
    title: "iPhone 13 promax128 Trắng",
    price: "11.599.000 đ",
    location: "TP Hồ Chí Minh",
    time: "2 ngày trước",
    tag: "Điện thoại",
    isFavorite: true,
  },
  {
    id: "3",
    image: require("../../assets/hoa.png"),
    title: "iPhone 12 promax128 Xanh biển-zin đẹp BH dài 6th",
    price: "7.599.000 đ",
    location: "TP Hồ Chí Minh",
    time: "5 ngày trước",
    tag: "Điện thoại",
    isFavorite: false,
  },
  {
    id: "4",
    image: require("../../assets/hoa.png"),
    title: "Dép lào",
    price: "50.000 đ",
    location: "Thủ Đức",
    time: "1 ngày trước",
    tag: "Giày dép",
    isFavorite: false,
  },
  {
    id: "5",
    image: require("../../assets/hoa.png"),
    title: "iPhone 12 promax 128 Xanh biển zin đẹp BH dài 6th",
    price: "7.599.000 đ",
    location: "TP Hồ Chí Minh",
    time: "7 ngày trước",
    tag: "Điện thoại",
    isFavorite: true,
  },
];

export default function ViewHistory() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleProductPress = (product: any) => {
    navigation.navigate("ProductDetail", { product });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleClearHistory = () => {
    console.log("Xóa lịch sử xem tin");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
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
          Lịch sử xem tin
        </Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* View History List - Vertical */}
        <View style={{ backgroundColor: "white" }}>
          {products.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleProductPress(item)}
              style={{
                flexDirection: "row",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#f3f4f6",
              }}
              activeOpacity={0.7}
            >
              <Image
                source={item.image}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                }}
                resizeMode="cover"
              />
              <View
                style={{
                  flex: 1,
                  marginLeft: 12,
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#1f2937",
                      marginBottom: 4,
                    }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#ef4444",
                      marginBottom: 4,
                    }}
                  >
                    {item.price}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color="#6b7280"
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          marginLeft: 2,
                        }}
                      >
                        {item.location}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons name="time-outline" size={12} color="#6b7280" />
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          marginLeft: 2,
                        }}
                      >
                        {item.time}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity>
                      <MaterialCommunityIcons
                        name="message-outline"
                        size={20}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Feather
                        name="heart"
                        size={20}
                        color={item.isFavorite ? "#ef4444" : "#d1d5db"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Clear History Button */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
          <TouchableOpacity
            onPress={handleClearHistory}
            style={{
              backgroundColor: "white",
              paddingVertical: 14,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#3b82f6",
              alignItems: "center",
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#3b82f6" }}>
              Bạn đã xem hết tin đăng ...
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Menu />
    </SafeAreaView>
  );
}
