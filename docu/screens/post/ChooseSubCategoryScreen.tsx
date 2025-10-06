import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChooseSubCategoryScreen({ navigation, route }: any) {
  const { category } = route.params;

  const subCategories: Record<string, string[]> = {
    "Tài liệu": ["Sách CNTT", "Đề cương", "Slide giảng dạy"],
    "Đồ điện tử": ["Laptop", "Điện thoại", "Máy tính bảng"],
    "Đồ gia dụng": ["Bàn ghế", "Tủ lạnh", "Nồi cơm điện"],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Chọn danh mục con</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {subCategories[category].map((sub, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.subCategoryItem}
            onPress={() => navigation.navigate("PostFormScreen", { category: sub })}
          >
            <Text style={styles.subCategoryText}>{sub}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 80,
    backgroundColor: "#9D7BFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },

  sectionHeader: {
    backgroundColor: "#F3F3F3",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
  },
  sectionHeaderText: { fontSize: 16, fontWeight: "600", color: "#111" },

  body: { padding: 20 },
  subCategoryItem: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  subCategoryText: { fontSize: 16, fontWeight: "500" },
});
