import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { path } from "../../config";
import { categoryEndpoints } from "../../src/constants/category-endpoints";

export default function ChooseSubCategoryScreen({ navigation, route }: any) {
  const { category } = route.params;
  interface SubCategory {
    id: number;
    name: string;
  }

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpointKey = categoryEndpoints[Number(category.id)];
    if (!endpointKey) {
      setSubCategories([]);
      setLoading(false);
      return;
    }

    const fullUrl = `${path}/sub-categories/${endpointKey}`;
    console.log("🔍 Đang gọi API:", fullUrl);

    axios.get(fullUrl)
      .then((res) => {
        const subData = res.data.map((item: any) => ({ name: item.name, id: item.id }));
        setSubCategories(subData);
      })
      .catch((err) => {
        console.log("❌ Lỗi khi lấy danh mục con:", err.message);
      })
      .finally(() => setLoading(false));
  }, [category]);


  const handleSelectSubCategory = (sub: SubCategory) => {
    navigation.navigate("PostFormScreen", {
      category: category,
      subCategory: sub,
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        {/* 🚨 SỬA: HIỂN THỊ category.name */}
        <Text style={styles.headerTitle}>{category.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Danh sách danh mục */}
      <ScrollView contentContainerStyle={styles.body}>
        {loading ? (
          <ActivityIndicator size="small" color="#9D7BFF" />
        ) : subCategories.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>Không có danh mục con.</Text>
        ) : (
          subCategories.map((sub, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.categoryItem}
              onPress={() => handleSelectSubCategory(sub)} // 👈 Dùng hàm mới
            >
              <Text style={styles.categoryText}>{sub.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 40,
    backgroundColor: "#9D7BFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
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
  body: { paddingHorizontal: 16, paddingVertical: 12 },
  categoryItem: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  iconPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: "#EEE",
    marginRight: 10,
  },
  categoryText: { fontSize: 15, fontWeight: "500", color: "#333" },
});
