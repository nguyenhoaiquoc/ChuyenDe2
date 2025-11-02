import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import debounce from "lodash.debounce";
import { RootStackParamList } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Suggestion = string;

const SearchProduct = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🔹 Từ khóa phổ biến (mock tĩnh, có thể thay bằng API)
  const popularKeywords = [
    "Áo thun nam",
    "Giày thể thao",
    "Tai nghe bluetooth",
    "Điện thoại iPhone",
    "Túi xách nữ",
  ];

  // ✅ Load lịch sử tìm kiếm
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("search_history");
      if (saved) setHistory(JSON.parse(saved));
    })();
  }, []);

  // ✅ Lưu lịch sử (giới hạn 10)
  const saveHistory = async (keyword: string) => {
    const newHistory = [keyword, ...history.filter((h) => h !== keyword)].slice(0, 10);
    setHistory(newHistory);
    await AsyncStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  // ✅ Gợi ý tìm kiếm (debounce 300ms)
  const fetchSuggestions = useCallback(
    debounce((text: string) => {
      if (!text.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const fakeSuggestions = [
        `${text} chính hãng`,
        `${text} giá rẻ`,
        `${text} cao cấp`,
        `Mua ${text} online`,
      ];
      setSuggestions(fakeSuggestions);
      setShowSuggestions(true);
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query]);

  // ✅ Xử lý tìm kiếm
  const handleSearch = async (keyword?: string) => {
    const searchText = (keyword || query).trim();
    if (!searchText) return;
    Keyboard.dismiss();
    await saveHistory(searchText);
    setShowSuggestions(false);
type SearchNavProp = NativeStackNavigationProp<RootStackParamList, "SearchProduct">;
const navigation = useNavigation<SearchNavProp>();

    navigation.navigate("SearchResultScreen", { query: searchText } );
  };

  // ✅ Xóa toàn bộ lịch sử
  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem("search_history");
  };

  // ✅ Giao diện từng item gợi ý
  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => handleSearch(item)}
      className="py-3 border-b border-gray-100 flex-row items-center"
    >
      <Feather name="search" size={16} color="gray" />
      <Text className="ml-3 text-gray-700">{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- Thanh tìm kiếm --- */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="gray" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 mx-2">
          <Feather name="search" size={18} color="gray" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#999"
            className="flex-1 ml-2 text-base text-gray-800"
            returnKeyType="search"
            onSubmitEditing={() => handleSearch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => handleSearch()}>
          <Text className="text-blue-600 font-medium">Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* --- Danh sách gợi ý --- */}
      {showSuggestions ? (
        <FlatList
          data={suggestions}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderSuggestion}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          data={[{ key: "static" }]}
          keyExtractor={(item) => item.key}
          renderItem={() => (
            <View className="px-4 pt-4">
              {/* --- Lịch sử tìm kiếm --- */}
              {history.length > 0 && (
                <>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-semibold text-gray-800">
                      Tìm kiếm gần đây
                    </Text>
                    <TouchableOpacity onPress={clearHistory}>
                      <Text className="text-red-500 text-sm">Xoá tất cả</Text>
                    </TouchableOpacity>
                  </View>
                  {history.map((h, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleSearch(h)}
                      className="py-2 flex-row items-center"
                    >
                      <Feather name="clock" size={16} color="gray" />
                      <Text className="ml-3 text-gray-700">{h}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* --- Từ khoá phổ biến --- */}
              <Text className="text-lg font-semibold mt-6 mb-2 text-gray-800">
                Từ khoá phổ biến
              </Text>
              <View className="flex-row flex-wrap">
                {popularKeywords.map((kw, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSearch(kw)}
                    className="bg-gray-100 px-3 py-2 rounded-2xl m-1"
                  >
                    <Text className="text-gray-700">{kw}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default SearchProduct;
