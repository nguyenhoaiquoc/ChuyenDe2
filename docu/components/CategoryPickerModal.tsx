// CategoryPickerModal.tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
  isSub?: boolean;
}

type Props = {
  visible: boolean;
  categories: CategoryNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
};

export default function CategoryPickerModal({
  visible,
  categories,
  selectedId,
  onSelect,
  onClose,
}: Props) {
  // CHỈ LẤY DANH MỤC CHA (không có isSub)
  const parentCategories = categories.filter((cat) => !cat.isSub);

  const renderItem = ({ item }: { item: CategoryNode }) => (
    <TouchableOpacity
      onPress={() => {
        onSelect(item.id);
        onClose();
      }}
      className={`px-5 py-3 border-b border-gray-200 ${
        selectedId === item.id ? "bg-indigo-100" : "bg-white"
      }`}
    >
      <Text className="text-base">{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl max-h-96">
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 py-3 border-b border-gray-200">
            <Text className="text-lg font-semibold">Chọn danh mục cha</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Không chọn gì (danh mục gốc) */}
          <TouchableOpacity
            onPress={() => {
              onSelect(null);
              onClose();
            }}
            className={`px-5 py-3 border-b border-gray-200 ${
              selectedId === null ? "bg-indigo-100" : "bg-white"
            }`}
          >
            <Text className="text-base text-gray-600">
              Không (danh mục gốc)
            </Text>
          </TouchableOpacity>

          {/* Danh sách cha */}
          <FlatList
            data={parentCategories}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text className="text-center py-5 text-gray-500">
                Chưa có danh mục cha
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}