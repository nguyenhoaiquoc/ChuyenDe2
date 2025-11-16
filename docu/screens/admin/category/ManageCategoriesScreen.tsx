// screens/admin/ManageCategoriesScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ManageCategoriesScreenNavigationProp } from "../../../types";
import { path } from "../../../config";

type Props = {
  navigation: ManageCategoriesScreenNavigationProp;
};

interface CategoryNode {
  id: string;
  name: string;
  parent_category_id: string | null;
  is_active: boolean;
  order_index: number;
  children?: CategoryNode[];
  isSub?: boolean; // để phân biệt cha/con
}

export default function ManageCategoriesScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryNode | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formParentId, setFormParentId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${path}/categories/with-children`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const apiData = response.data; // [{ id, name, children: [SubCategory] }]
      const tree = apiData.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        parent_category_id: null,
        is_active: true,
        children: (cat.children || []).map((sub: any) => ({
          ...sub,
          parent_category_id: cat.id,
          isSub: true,
        })),
      }));

      setCategories(tree);
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err.response?.data?.message || "Không tải được danh mục"
      );
    } finally {
      setLoading(false);
    }
  };

  // Chuyển danh sách phẳng → cây
  const buildCategoryTree = (list: CategoryNode[]): CategoryNode[] => {
    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    list.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    list.forEach((cat) => {
      if (cat.parent_category_id && map.has(cat.parent_category_id)) {
        map.get(cat.parent_category_id)!.children!.push(map.get(cat.id)!);
      } else {
        roots.push(map.get(cat.id)!);
      }
    });

    // Sắp xếp con
    roots.forEach(sortChildren);
    return roots;
  };

  const sortChildren = (node: CategoryNode) => {
    if (node.children) {
      node.children.sort((a, b) => a.order_index - b.order_index);
      node.children.forEach(sortChildren);
    }
  };

  const handleSave = async () => {
    if (!formName.trim()) return Alert.alert("Lỗi", "Nhập tên danh mục");

    try {
      const token = await AsyncStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (editingCat) {
        // Sửa: chỉ sửa được tên
        if (editingCat.isSub) {
          await axios.put(
            `${path}/sub-categories/${editingCat.id}`,
            { name: formName },
            { headers }
          );
        } else {
          await axios.put(
            `${path}/categories/${editingCat.id}`,
            { name: formName },
            { headers }
          );
        }
      } else {
        // Thêm mới
        if (formParentId) {
          // Thêm danh mục con
          await axios.post(
            `${path}/sub-categories`,
            {
              name: formName,
              parent_category_id: formParentId,
              source_table: "categories",
            },
            { headers }
          );
        } else {
          // Thêm danh mục cha
          await axios.post(
            `${path}/categories`,
            { name: formName },
            { headers }
          );
        }
      }

      resetForm();
      fetchCategories();
    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Lưu thất bại");
    }
  };

  const handleDelete = (id: string | number, isSub: boolean) => {
    Alert.alert("Xác nhận", "Xóa danh mục này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            if (isSub) {
              await axios.delete(`${path}/sub-categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } else {
              // Xóa cha → cần xóa con trước? Hoặc backend xử lý cascade
              await axios.delete(`${path}/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            }
            fetchCategories();
          } catch (err: any) {
            Alert.alert("Lỗi", err.response?.data?.message || "Không thể xóa");
          }
        },
      },
    ]);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.patch(
        `/api/admin/categories/${id}/toggle`,
        { is_active: !current },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCategories();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormParentId(null);
    setEditingCat(null);
    setShowAddModal(false);
  };

  const openEdit = (cat: CategoryNode) => {
    setEditingCat(cat);
    setFormName(cat.name);
    setFormParentId(cat.parent_category_id);
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-indigo-700">
          Quản lý Danh mục
        </Text>
        <TouchableOpacity
          onPress={() => {
            setEditingCat(null);
            setFormName("");
            setFormParentId(null);
            setShowAddModal(true);
          }}
          className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center"
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-medium ml-1">Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Tìm kiếm */}
      <View className="px-5 mt-3">
        <TextInput
          placeholder="Tìm danh mục..."
          value={searchText}
          onChangeText={setSearchText}
          className="bg-white border border-gray-300 rounded-xl px-4 py-3"
        />
      </View>

      {/* Danh sách cây */}
      <ScrollView className="flex-1 mt-4">
        {categories.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">
            Chưa có danh mục
          </Text>
        ) : (
          categories.map((cat) => (
            <CategoryTreeItem
              key={cat.id}
              item={cat}
              level={0}
              onEdit={openEdit}
              onDelete={(id) => handleDelete(id, false)}
              onToggle={() => {}}
              searchText={searchText}
            />
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Modal Thêm/Sửa */}
      {showAddModal && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-xl font-bold mb-4">
              {editingCat ? "Sửa danh mục" : "Thêm danh mục mới"}
            </Text>

            <Text className="text-sm text-gray-600 mb-1">Tên danh mục</Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="Nhập tên..."
              className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
            />

            <Text className="text-sm text-gray-600 mb-1">Danh mục cha</Text>
            <View className="border border-gray-300 rounded-lg mb-4">
              <TouchableOpacity
                onPress={() => {
                  // Có thể mở picker chọn cha
                  Alert.alert("Chọn cha", "Tính năng chọn cha sẽ làm sau");
                }}
                className="px-3 py-2 flex-row justify-between items-center"
              >
                <Text>{formParentId ? "Có cha" : "Không (danh mục gốc)"}</Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={resetForm}
                className="px-5 py-2 border border-gray-300 rounded-lg"
              >
                <Text className="text-gray-700">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="bg-indigo-600 px-5 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Component cây danh mục
const CategoryTreeItem = ({
  item,
  level,
  allCategories,
  onEdit,
  onDelete,
  onToggle,
  searchText,
}: {
  item: CategoryNode;
  level: number;
  allCategories: CategoryNode[];
  onEdit: (cat: CategoryNode) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
  searchText: string;
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  // Ẩn nếu không khớp tìm kiếm
  if (
    searchText &&
    !item.name.toLowerCase().includes(searchText.toLowerCase())
  ) {
    return null;
  }

  return (
    <View>
      <View
        className={`flex-row items-center justify-between bg-white px-4 py-3 rounded-lg mx-5 mb-2 ${
          level > 0 ? "ml-8" : ""
        }`}
        style={{ marginLeft: level * 20 }}
      >
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={() => hasChildren && setExpanded(!expanded)}
        >
          {hasChildren && (
            <Ionicons
              name={expanded ? "chevron-down" : "chevron-forward"}
              size={18}
              color="#666"
              className="mr-1"
            />
          )}
          <Text
            className={`font-medium ${!item.is_active ? "text-gray-400" : ""}`}
          >
            {item.name}
          </Text>
          {!item.is_active && (
            <Text className="ml-2 text-xs text-red-500">(Ẩn)</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row space-x-2">
          <TouchableOpacity onPress={() => onToggle(item.id, item.is_active)}>
            <Ionicons
              name={item.is_active ? "eye" : "eye-off"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onEdit(item)}>
            <Ionicons name="pencil" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Ionicons name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {expanded &&
        item.children?.map((child) => (
          <CategoryTreeItem
            key={child.id}
            item={child}
            level={level + 1}
            allCategories={allCategories}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            searchText={searchText}
          />
        ))}
    </View>
  );
};
