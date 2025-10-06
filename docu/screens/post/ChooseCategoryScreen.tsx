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

export default function ChooseCategoryScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Đăng tin</Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Chọn danh mục</Text>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        <TouchableOpacity
          style={styles.categoryItem}
          onPress={() =>
            navigation.navigate("ChooseSubCategoryScreen", { category: "Tài liệu" })
          }
        >
          <Text style={styles.categoryText}>📚  Tài liệu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryItem}
          onPress={() =>
            navigation.navigate("ChooseSubCategoryScreen", { category: "Đồ điện tử" })
          }
        >
          <Text style={styles.categoryText}>📱  Đồ điện tử</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryItem}
          onPress={() =>
            navigation.navigate("ChooseSubCategoryScreen", { category: "Đồ gia dụng" })
          }
        >
          <Text style={styles.categoryText}>🛋️  Đồ gia dụng</Text>
        </TouchableOpacity>
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
  categoryItem: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  categoryText: { fontSize: 16, fontWeight: "500" },
});
