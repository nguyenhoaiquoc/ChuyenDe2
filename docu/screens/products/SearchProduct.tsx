import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import axios from "axios";
import { path } from "../../config";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SearchScreen">;
};

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Gọi API gợi ý từ server
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim() === "") {
        setSuggestions([]);
        return;
      }

      axios
        .get(`${path}/products/suggestions?q=${encodeURIComponent(query)}`)
        .then((res) => {
          setSuggestions(res.data);
          setShowSuggestions(true);
        })
        .catch(() => {
          setSuggestions([]);
        });
    }, 300); // debounce 300ms

    return () => clearTimeout(timeout);
  }, [query]);

  // Khi nhấn tìm kiếm hoặc chọn gợi ý
  const handleSearch = (text?: string) => {
    const q = text || query;
    if (!q.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setShowSuggestions(false);
    navigation.navigate("SearchResultScreen", { query: q });
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Ô tìm kiếm */}
      <View className="flex-row items-center px-3 py-2 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="black" />
        </TouchableOpacity>

        <View className="flex-row items-center px-3 py-2 bg-white shadow z-10 flex-1 mx-2 rounded border border-gray-300">
          <Feather name="search" size={18} color="gray" />
          <TextInput
            placeholder="Tìm kiếm sản phẩm..."
            value={query}
            onChangeText={setQuery}
            onFocus={() => setShowSuggestions(true)}
            onSubmitEditing={() => handleSearch()}
            className="flex-1 px-2 py-2 text-base"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x-circle" size={18} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => handleSearch()}>
          <Text className="text-blue-600 font-medium ml-2">Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách gợi ý */}
      {showSuggestions && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => index.toString()}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSearch(item)}
              className="px-4 py-3 border-b border-gray-100 flex-row items-center"
            >
              <Feather name="clock" size={16} color="gray" />
              <Text className="ml-3 text-gray-700">{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Không có gợi ý */}
      {showSuggestions && suggestions.length === 0 && query.length > 0 && (
        <View className="p-4">
          <Text className="text-gray-500">Không tìm thấy gợi ý nào cho “{query}”.</Text>
        </View>
      )}

      {/* Loading khi chuyển màn */}
      {loading && (
        <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
}
