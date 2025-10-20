import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import Menu from "../../components/Menu";

const statusTabs = [
  "Đang hiển thị ",
  "Hết hạn",
  "Bị từ chối ",
  "Cần thanh toán ",
  "Chờ duyệt ",
  "Bị ẩn ",
];

export default function ManagePostsScreen({ navigation }: any) {
  const [activeStatus, setActiveStatus] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý đăng tin</Text>
        <View style={styles.headerIcons}>
          <Feather name="search" size={22} color="black" style={styles.icon} />
          <Ionicons
            name="chatbox-ellipses-outline"
            size={22}
            color="black"
            style={styles.icon}
          />
          <Feather name="bell" size={24} color="black" style={styles.icon} />
        </View>
      </View>

      {/* Body */}
      <ScrollView style={styles.body} contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity style={styles.contactListButton}>
          <Text style={styles.contactListText}>Danh sách liên hệ </Text>
        </TouchableOpacity>

        {/* Profile */}
        <View style={styles.profileContainer}>
          <Image source={require("../../assets/meo.jpg")} style={styles.avatar} />
          <View style={styles.profileText}>
            <Text style={styles.name}>Lê Đức Quý</Text>
            <TouchableOpacity>
              <Text style={styles.createShop}>+ Tạo cửa hàng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusTabs}
        >
          {statusTabs.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.statusTab,
                index === activeStatus && styles.statusTabActive,
              ]}
              onPress={() => setActiveStatus(index)}
            >
              <Text
                style={[
                  styles.statusText,
                  index === activeStatus && styles.statusTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#888" />
          <TextInput
            placeholder="Tìm tin đăng của bạn"
            style={styles.searchInput}
          />
        </View>

        {/* No posts */}
        <View style={styles.noPosts}>
          <Text style={styles.noPostsTitle}>Không tìm thấy tin đăng</Text>
          <Text style={styles.noPostsSubtitle}>
            Bạn hiện tại không có tin đăng nào cho trạng thái này
          </Text>
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => navigation.navigate("ChooseCategory")}
          >
            <Text onPress={() => navigation.navigate("ChooseCategoryScreen")} style={styles.postButtonText}>Đăng tin</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Menu />
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: "#F2F0FF",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  headerIcons: { flexDirection: "row" },
  icon: { marginLeft: 16 },

  body: { flex: 1 },
  profileContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  profileText: { marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  createShop: { color: "#3C2EFC", marginTop: 4 },

  statusTabs: { marginVertical: 10 },
  statusTab: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
  },
  statusTabActive: { backgroundColor: "#3C2EFC" },
  statusText: { fontSize: 14, color: "#333" },
  statusTextActive: { color: "#fff" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 8,
    marginVertical: 10,
    height: 50,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  noPosts: { alignItems: "center", marginTop: 50 },
  noPostsTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  noPostsSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: "#F6C200",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 6,
  },
  postButtonText: { fontWeight: "600", fontSize: 14 },

  contactListButton: {
    backgroundColor: "#E5E5E5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  contactListText: { fontSize: 14, color: "#555" },
});
