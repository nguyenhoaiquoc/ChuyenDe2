// screens/ManagerHistory.tsx
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
import { Ionicons, Feather } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

const savedPosts = [
  {
    id: "1",
    image: require("../../assets/hoa.png"),
    title: "iPhone 12 promax128 Xanh biển-zin đẹp BH dài 6th",
    price: "7.599.000 đ",
    location: "TP Hồ Chí Minh",
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
    title: "Giày nike real 100%",
    price: "1.599.000 đ",
    location: "Thủ Đức",
    time: "2 ngày trước",
    tag: "Giày dép",
    isFavorite: true,
  },
];

const recommendedPosts = [
  {
    id: "4",
    image: require("../../assets/hoa.png"),
    title: "iPhone 12 promax 128 Xanh biển zin đẹp BH dài 6th",
    price: "7.599.000 đ",
    location: "TP Hồ Chí Minh",
    time: "7 ngày trước",
    tag: "Điện thoại",
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
    isFavorite: false,
  },
  {
    id: "6",
    image: require("../../assets/hoa.png"),
    title: "iPhone 12 promax 128 Xanh biển zin đẹp BH dài 6th",
    price: "7.599.000 đ",
    location: "TP Hồ Chí Minh",
    time: "7 ngày trước",
    tag: "Điện thoại",
    isFavorite: false,
  },
  {
    id: "7",
    image: require("../../assets/hoa.png"),
    title: "Balo laptop chống nước 15inch",
    price: "220.000 đ",
    location: "Thủ Đức",
    time: "1 ngày trước",
    tag: "Đồ gia dụng",
    isFavorite: false,
  },
];

export default function SavedPosts() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleProductPress = (product: any) => {
    navigation.navigate("ProductDetail", { product });
  };

  const handleBackPress = () => {
    navigation.goBack();
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
          Tin đăng đã lưu (3/100)
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Saved Posts Section - Vertical List */}
        <View style={{ backgroundColor: "white", paddingVertical: 12 }}>
          {savedPosts.map((item) => (
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {item.time}
                  </Text>
                  <TouchableOpacity>
                    <Feather
                      name="heart"
                      size={20}
                      color={item.isFavorite ? "#ef4444" : "#d1d5db"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended Posts Section - Grid */}
        <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: 12,
            }}
          >
            Tin đăng dành cho bạn
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {recommendedPosts.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleProductPress(item)}
                style={{
                  width: "48%",
                  backgroundColor: "white",
                  borderRadius: 8,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={item.image}
                  style={{
                    width: "100%",
                    height: 120,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                  resizeMode="cover"
                />
                <View style={{ padding: 8 }}>
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
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>
                      {item.location}
                    </Text>
                    <TouchableOpacity>
                      <Feather
                        name="heart"
                        size={18}
                        color={item.isFavorite ? "#ef4444" : "#d1d5db"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Menu />
    </SafeAreaView>
  );
}
