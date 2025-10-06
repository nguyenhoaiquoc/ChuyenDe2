import React from "react";
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Menu from "../../components/Menu";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";

const searches = [
  { id: "1", query: "iPhone 12", time: "2 ngày trước" },
  { id: "2", query: "Nike giày", time: "5 ngày trước" },
  { id: "3", query: "Balo laptop", time: "1 tuần trước" },
];

export default function SavedSearchScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBackPress = () => {
    navigation.goBack();
  };

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
          Tìm kiếm đã lưu
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={searches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: "white",
              padding: 16,
              borderRadius: 8,
              marginBottom: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16, color: "#1f2937" }}>{item.query}</Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
      <Menu />
    </SafeAreaView>
  );
}
