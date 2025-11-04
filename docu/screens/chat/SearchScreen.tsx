import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import "../../global.css";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { path } from '../../config';

type Props = { navigation: any };

type SearchItem = {
  id: number;
  conversation_id: number | null;
  sender_id: number | null;
  content: string | null;
  created_at: string;
  rank: number;
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = await AsyncStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export default function SearchScreen({ navigation }: Props) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedQ = useDebounced(q, 400);
  const canSearch = debouncedQ.trim().length >= 3;

  useEffect(() => {
    if (!canSearch) {
      setItems([]);
      setNextCursor(null);
      setError(null);
      return;
    }
    fetchFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const fetchFirst = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${path}/chat/search`, {
        params: { q: debouncedQ.trim(), limit: 20 },
        headers,
      });
      setItems(res.data?.data?.items ?? []);
      setNextCursor(res.data?.data?.nextCursor ?? null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = async () => {
    if (!nextCursor || loading) return;
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${path}/chat/search`, {
        params: { q: debouncedQ.trim(), limit: 20, cursor: nextCursor },
        headers,
      });
      setItems(prev => [...prev, ...(res.data?.data?.items ?? [])]);
      setNextCursor(res.data?.data?.nextCursor ?? null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra');
    }
  };

  const openFromSearch = async (hit: SearchItem) => {
    try {
      if (!hit.conversation_id) return;

      const [token, currentUserIdStr, currentUserName] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('userName'),
      ]);
      if (!token || !currentUserIdStr) return;
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(`${path}/chat/room/${hit.conversation_id}/meta`, { headers });
      const meta = res.data?.data;

      navigation.navigate('ChatRoomScreen' as any, {
        roomId: Number(hit.conversation_id),
        highlightMessageId: Number(hit.id),
        searchKeyword: debouncedQ.trim(),              // 👈 pass keyword để tô đậm
        product: meta?.product ?? null,
        otherUserId: meta?.partner?.id ?? null,
        otherUserName: meta?.partner?.name ?? '',
        otherUserAvatar: meta?.partner?.avatar ?? undefined,
        // giữ tương thích, ChatRoomScreen không cần nữa nhưng không hại
        token,
        currentUserId: Number(currentUserIdStr),
        currentUserName: currentUserName || 'Tôi',
      });
    } catch (e) {
      const [token, currentUserIdStr, currentUserName] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('userName'),
      ]);
      navigation.navigate('ChatRoomScreen' as any, {
        roomId: Number(hit.conversation_id),
        highlightMessageId: Number(hit.id),
        searchKeyword: debouncedQ.trim(),              // 👈 vẫn pass keyword
        token,
        currentUserId: Number(currentUserIdStr),
        currentUserName: currentUserName || 'Tôi',
      });
    }
  };

  const renderItem = ({ item }: { item: SearchItem }) => (
    <TouchableOpacity
      className="px-4 py-3 border-b border-gray-100"
      onPress={() => openFromSearch(item)}
    >
      <Text className="text-gray-500 text-xs">
        {new Date(item.created_at).toLocaleString()}
      </Text>
      <HighlightedText text={item.content ?? ''} keyword={debouncedQ} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />
      <View className="flex flex-row items-center justify-between mt-14 w-full px-5 border-b border-gray-200 pb-5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Feather name="arrow-left" size={22} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl text-center flex-1 font-bold ">
          Trang tìm kiếm tin nhắn
        </Text>
        <View className="w-5" />
      </View>

      <View className="flex flex-row items-center gap-3 mx-4 border mt-5 border-gray-200 rounded-xl px-3">
        <FontAwesome5 name="search" size={18} color="gray" />
        <TextInput
          className="py-3 flex-1"
          placeholder="Nhập 3 ký tự cần tìm kiếm"
          value={q}
          onChangeText={setQ}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading ? <ActivityIndicator /> : null}
      </View>

      {q.trim().length > 0 && !canSearch ? (
        <Text className="text-center text-gray-500 mt-4">Nhập tối thiểu 3 ký tự…</Text>
      ) : null}

      {error ? (
        <Text className="text-center text-red-500 mt-3">{error}</Text>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.6}
        ListEmptyComponent={
          canSearch && !loading
            ? <Text className="text-center text-gray-500 mt-6">Không tìm thấy kết quả</Text>
            : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

/** ===== Helpers ===== */
function useDebounced(value: string, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function HighlightedText({ text, keyword }: { text: string; keyword: string }) {
  const parts = useMemo(() => splitHighlight(text, keyword), [text, keyword]);
  if (!keyword || !text) return <Text className="text-base mt-1" numberOfLines={3}>{text}</Text>;
  return (
    <Text className="text-base mt-1" numberOfLines={3}>
      {parts.map((p, idx) =>
        p.hit ? (
          <Text key={idx} className="bg-yellow-200 rounded-sm">{p.text}</Text>
        ) : (
          <Text key={idx}>{p.text}</Text>
        )
      )}
    </Text>
  );
}

function splitHighlight(text: string, keyword: string) {
  if (!keyword) return [{ text, hit: false }];
  const k = keyword.toLowerCase();
  const t = text;
  const tl = t.toLowerCase();
  const out: { text: string; hit: boolean }[] = [];
  let i = 0;
  while (true) {
    const idx = tl.indexOf(k, i);
    if (idx === -1) { out.push({ text: t.slice(i), hit: false }); break; }
    if (idx > i) out.push({ text: t.slice(i, idx), hit: false });
    out.push({ text: t.slice(idx, idx + k.length), hit: true });
    i = idx + k.length;
  }
  return out;
}
