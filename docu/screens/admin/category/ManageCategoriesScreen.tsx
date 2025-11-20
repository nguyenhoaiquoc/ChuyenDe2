import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ManageCategoriesScreenNavigationProp } from "../../../types";
import { path } from "../../../config";
import CategoryPickerModal from "../../../components/CategoryPickerModal";
import DraggableFlatList from "react-native-draggable-flatlist";
import * as ImagePicker from "expo-image-picker"; // ← THÊM DÒNG NÀY

type Props = {
  navigation: ManageCategoriesScreenNavigationProp;
};

interface CategoryNode {
  id: string;
  name: string;
  image_url?: string;
  parent_category_id: string | null;
  order_index: number;
  children?: CategoryNode[];
  isSub?: boolean;
}

// THÊM TYPE CHO ẢNH ĐÃ CHỌN
interface SelectedImage {
  uri: string;
  mimeType?: string;
}

export default function ManageCategoriesScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryNode | null>(null);
  const [formName, setFormName] = useState("");
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempParentId, setTempParentId] = useState<string | null>(null);

  // STATE MỚI CHO ẢNH
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  // HÀM CHỌN ẢNH
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Cần quyền", "Vui lòng cấp quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType || "image/jpeg",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${path}/categories/with-children`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tree = response.data.map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.name,
        image_url: cat.image
          ? cat.image.startsWith("http")
            ? cat.image
            : `${path}${cat.image.startsWith("/") ? "" : "/uploads/categories/"}${cat.image}`
          : null,
        parent_category_id: null,
        order_index: cat.order_index || 0,
        children: (cat.children || []).map((sub: any) => ({
          ...sub,
          id: sub.id.toString(),
          parent_category_id: cat.id.toString(),
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

  const handleDelete = (id: string | number, isSub: boolean) => {
    const cat = categories.find((c) => c.id === id.toString());
    const hasChildren = cat?.children && cat.children.length > 0;

    let message = "Xóa danh mục này?";
    if (hasChildren) {
      message = `Danh mục này có ${cat!.children!.length} danh mục con. Xóa sẽ xóa toàn bộ!`;
    }

    Alert.alert("Xác nhận", message, [
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
 
  const handleSave = async () => {
    if (!formName.trim()) return Alert.alert("Lỗi", "Nhập tên danh mục");

    if (editingCat?.isSub && !formParentId) {
      return Alert.alert("Lỗi", "Danh mục con phải có danh mục cha");
    }

    try {
      const token = await AsyncStorage.getItem("token");

      if (editingCat) {
        if (editingCat.isSub) {
          await axios.put(
            `${path}/sub-categories/${editingCat.id}`,
            {
              name: formName,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // SỬA DANH MỤC CHA – CÓ ẢNH
          const formData = new FormData();
          formData.append("name", formName);

          if (selectedImage) {
            formData.append("image", {
              uri: selectedImage.uri,
              type: selectedImage.mimeType || "image/jpeg",
              name: "category.jpg",
            } as any);
          }

          await axios.put(`${path}/categories/${editingCat.id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } else {
        if (formParentId) {
          await axios.post(
            `${path}/sub-categories`,
            {
              name: formName,
              parent_category_id: Number(formParentId),
              source_table: "categories",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.post(
            `${path}/categories`,
            { name: formName },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      resetForm();
      fetchCategories();
    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Lưu thất bại");
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormParentId(null);
    setTempParentId(null);
    setEditingCat(null);
    setSelectedImage(null); 
    setShowAddModal(false);
  };

  const openEdit = (cat: CategoryNode) => {
    setEditingCat(cat);
    setFormName(cat.name);
    setFormParentId(cat.parent_category_id);
    setTempParentId(cat.parent_category_id);
    setSelectedImage(null);
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
      {categories.length === 0 ? (
        <Text className="text-center text-gray-500 mt-10">
          Chưa có danh mục
        </Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryTreeItem
              item={item}
              level={0}
              onEdit={openEdit}
              onDelete={handleDelete}
              searchText={searchText}
            />
          )}
          ListHeaderComponent={
            <>
              <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-indigo-700">
                  Quản lý Danh mục
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditingCat(null);
                    setFormName("");
                    setFormParentId(null);
                    setTempParentId(null);
                    setSelectedImage(null);
                    setShowAddModal(true);
                  }}
                  className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center"
                >
                  <Ionicons name="add" size={18} color="white" />
                  <Text className="text-white font-medium ml-1">Thêm</Text>
                </TouchableOpacity>
              </View>

              <View className="px-5 mt-3 mb-3">
                <TextInput
                  placeholder="Tìm danh mục..."
                  value={searchText}
                  onChangeText={setSearchText}
                  className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                />
              </View>
            </>
          }
        />
      )}

      {/* MODAL THÊM/SỬA – ĐÃ CÓ CHỌN ẢNH */}
      {showAddModal && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-2xl p-5 w-full max-h-[90%]">
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

            {/* CHỌN ẢNH – CHỈ HIỆN KHI SỬA DANH MỤC CHA */}
            {editingCat && !editingCat.isSub && (
              <>
                <Text className="text-sm text-gray-600 mb-2">Ảnh danh mục</Text>

                {/* Preview ảnh hiện tại */}
                {(selectedImage || editingCat.image_url) && (
                  <Image
                    source={{
                      uri: selectedImage?.uri || editingCat.image_url!,
                    }}
                    className="w-32 h-32 rounded-xl mb-3 self-center"
                    resizeMode="cover"
                  />
                )}

                {/* Nút chọn ảnh */}
                <TouchableOpacity
                  onPress={pickImage}
                  className="border-2 border-dashed border-indigo-500 rounded-xl p-8 items-center justify-center mb-4"
                >
                  <Ionicons name="camera-outline" size={40} color="#6366F1" />
                  <Text className="text-indigo-600 mt-2 font-medium">
                    {selectedImage ? "Đổi ảnh" : "Chọn ảnh mới"}
                  </Text>
                </TouchableOpacity>

                {selectedImage && (
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    className="self-center mb-3"
                  >
                    <Text className="text-red-500 text-sm">
                      Xóa ảnh đã chọn
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Danh mục cha */}
            {(!editingCat) && (
              <>
                <Text className="text-sm text-gray-600 mb-1">
                  Danh mục cha
                  {editingCat && (
                    <Text className="text-red-500"> *</Text>
                  )}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  className={`border rounded-lg px-3 py-2 mb-4 flex-row justify-between items-center ${
                    editingCat && !tempParentId
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <Text
                    className={
                      editingCat && !tempParentId ? "text-red-500" : ""
                    }
                  >
                    {tempParentId
                      ? categories.find((c) => c.id === tempParentId)?.name ||
                        "Đang tải..."
                      : editingCat
                        ? "Vui lòng chọn danh mục cha"
                        : "Không (danh mục gốc)"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#666" />
                </TouchableOpacity>
              </>
            )}

            <View className="flex-row justify-end space-x-3 mt-4">
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

      <CategoryPickerModal
        visible={showPicker}
        categories={categories}
        selectedId={tempParentId}
        onSelect={(id) => {
          const selected = categories.find((c) => c.id === id);
          if (selected?.isSub) {
            Alert.alert("Lỗi", "Không thể chọn danh mục con làm cha");
            return;
          }
          setTempParentId(id);
          setFormParentId(id);
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
      />
    </SafeAreaView>
  );
}

// CategoryTreeItem giữ nguyên như cũ
const CategoryTreeItem = ({
  item,
  level,
  onEdit,
  onDelete,
  searchText,
}: {
  item: CategoryNode;
  level: number;
  onEdit: (cat: CategoryNode) => void;
  onDelete: (id: string, isSub: boolean) => void;
  searchText: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (
    searchText &&
    !item.name.toLowerCase().includes(searchText.toLowerCase())
  ) {
    return null;
  }

  return (
    <View>
      <View
        className={`flex-row items-center justify-between bg-white px-4 py-4 rounded-xl mx-5 mb-3 shadow-sm ${level > 0 ? "ml-12" : ""}`}
        style={{ marginLeft: level * 24 }}
      >
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={() => hasChildren && setExpanded(!expanded)}
        >
          {!item.isSub && item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              className="w-14 h-14 rounded-lg mr-4"
              resizeMode="cover"
            />
          ) : !item.isSub ? (
            <View className="w-14 h-14 bg-gray-200 rounded-lg mr-4 border-2 border-dashed border-gray-400 justify-center items-center">
              <Ionicons name="image-outline" size={28} color="#999" />
            </View>
          ) : null}

          {hasChildren && (
            <Ionicons
              name={expanded ? "chevron-down" : "chevron-forward"}
              size={20}
              color="#666"
              className="mr-2"
            />
          )}

          <View className="flex-1">
            <Text
              className={`font-semibold text-base ${item.isSub ? "text-gray-800" : "text-indigo-700"}`}
            >
              {item.name}
            </Text>
            {hasChildren && (
              <Text className="text-xs text-gray-500 mt-1">
                {item.children?.length} danh mục con
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View className="flex-row space-x-3">
          <TouchableOpacity onPress={() => onEdit(item)}>
            <Ionicons name="pencil" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id, item.isSub ?? false)}>
            <Ionicons name="trash" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {expanded &&
        item.children?.map((child) => (
          <CategoryTreeItem
            key={child.id}
            item={child}
            level={level + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            searchText={searchText}
          />
        ))}
    </View>
  );
};
