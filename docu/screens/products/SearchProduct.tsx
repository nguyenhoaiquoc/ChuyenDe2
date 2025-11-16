import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Keyboard,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import debounce from "lodash.debounce";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Hiệu ứng fade in
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    fadeIn();
  }, []);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("search_history");
      if (saved) setHistory(JSON.parse(saved));
    })();
  }, []);

  const saveHistory = async (keyword: string) => {
    const newHistory = [keyword, ...history.filter((h) => h !== keyword)].slice(0, 8);
    setHistory(newHistory);
    await AsyncStorage.setItem("search_history", JSON.stringify(newHistory));
  };

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
      fetchSuggestions.cancel();
    };
  }, []);

  const handleSearch = async (keyword?: string) => {
    const searchText = (keyword || query).trim();
    if (!searchText) return;
    Keyboard.dismiss();
    await saveHistory(searchText);
    setShowSuggestions(false);
    navigation.navigate("SearchResultScreen", { query: searchText });
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem("search_history");
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => handleSearch(item)}
      style={{
        flexDirection: "row",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2",
        alignItems: "center",
      }}
    >
      <Feather name="search" size={16} color="#888" />
      <Text style={{ marginLeft: 12, color: "#333", fontSize: 15 }}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* Thanh tìm kiếm */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
          backgroundColor: "#fff",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 8 }}>
          <Feather name="arrow-left" size={22} color="#555" />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f5f5f7",
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Feather name="search" size={18} color="#999" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#aaa"
            style={{ flex: 1, marginLeft: 8, fontSize: 16, color: "#333" }}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={{ padding: 6 }}>
              <Feather name="x-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => handleSearch()}
          style={{ marginLeft: 8, backgroundColor: "#007AFF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Text style={{ color: "#fff", fontWeight: "500" }}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {showSuggestions ? (
          <FlatList
            data={suggestions}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderSuggestion}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Lịch sử tìm kiếm */}
            {history.length > 0 && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
                    Tìm kiếm gần đây
                  </Text>
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={{ color: "#FF3B30", fontSize: 14 }}>Xoá tất cả</Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginBottom: 16,
                  }}
                >
                  {history.map((h, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleSearch(h)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#f2f2f7",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 16,
                        margin: 4,
                      }}
                    >
                      <Feather name="clock" size={14} color="#777" />
                      <Text style={{ marginLeft: 6, color: "#333" }}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Từ khoá phổ biến */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                marginTop: 8,
                marginBottom: 8,
                color: "#333",
              }}
            >
              Từ khoá phổ biến
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {popularKeywords.map((kw, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSearch(kw)}
                  style={{
                    backgroundColor: "#EAF4FF",
                    borderColor: "#007AFF33",
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 18,
                    margin: 4,
                  }}
                >
                  <Text style={{ color: "#007AFF", fontWeight: "500" }}>{kw}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

export default SearchProduct;
