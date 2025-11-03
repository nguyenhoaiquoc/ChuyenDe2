import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  Keyboard,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import debounce from "lodash.debounce";
import { RootStackParamList } from "../../types";
import { path } from "../../config";

type Suggestion = string;
type SearchNavProp = NativeStackNavigationProp<RootStackParamList, "SearchProduct">;

const popularKeywords = [
  "Áo thun nam",
  "Giày thể thao",
  "Tai nghe bluetooth",
  "Điện thoại iPhone",
  "Túi xách nữ",
];

const SearchProduct = () => {
  const navigation = useNavigation<SearchNavProp>();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- Load history từ AsyncStorage ---
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("search_history");
      if (saved) setHistory(JSON.parse(saved));
    })();
  }, []);

  // --- Lưu history, giới hạn 10 item ---
  const saveHistory = async (keyword: string) => {
    const newHistory = [keyword, ...history.filter((h) => h !== keyword)].slice(0, 10);
    setHistory(newHistory);
    await AsyncStorage.setItem("search_history", JSON.stringify(newHistory));
  };

  // --- Gợi ý tìm kiếm (debounce 300ms) ---
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

  useEffect(() => {
    return () => {
      fetchSuggestions.cancel(); // cancel debounce khi unmount
    };
  }, []);

  // --- Handle search ---
  const handleSearch = async (keyword?: string) => {
    const searchText = (keyword || query).trim();
    if (!searchText) return;
    Keyboard.dismiss();
    await saveHistory(searchText);
    setShowSuggestions(false);
    navigation.navigate("SearchResultScreen", { query: searchText });
  };

  // --- Clear history ---
  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem("search_history");
  };

  // --- Render suggestion item ---
  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => handleSearch(item)}
      style={{
        flexDirection: "row",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        alignItems: "center",
      }}
    >
      <Feather name="search" size={16} color="gray" />
      <Text style={{ marginLeft: 12, color: "#333" }}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Thanh tìm kiếm */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="gray" />
        </TouchableOpacity>

        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", borderRadius: 8, paddingHorizontal: 10, marginHorizontal: 8 }}>
          <Feather name="search" size={18} color="gray" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#999"
            style={{ flex: 1, marginLeft: 8, fontSize: 16, color: "#333" }}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={{ padding: 6 }}>
              <Feather name="x-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => handleSearch()}>
          <Text style={{ color: "#007AFF", fontWeight: "500" }}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung */}
      {showSuggestions ? (
        <FlatList
          data={suggestions}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderSuggestion}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }} keyboardShouldPersistTaps="handled">
          {/* Lịch sử tìm kiếm */}
          {history.length > 0 && (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>Tìm kiếm gần đây</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={{ color: "#FF3B30", fontSize: 14 }}>Xoá tất cả</Text>
                </TouchableOpacity>
              </View>
              {history.map((h, i) => (
                <TouchableOpacity key={i} onPress={() => handleSearch(h)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
                  <Feather name="clock" size={16} color="gray" />
                  <Text style={{ marginLeft: 12, color: "#333" }}>{h}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Từ khoá phổ biến */}
          <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 24, marginBottom: 8, color: "#333" }}>Từ khoá phổ biến</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {popularKeywords.map((kw, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleSearch(kw)}
                style={{ backgroundColor: "#f0f0f0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, margin: 4 }}
              >
                <Text style={{ color: "#333" }}>{kw}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 40 }} /> {/* padding bottom */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SearchProduct;
