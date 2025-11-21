import React, { useEffect, useState } from "react";
import { View, FlatList, Image, TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import * as MediaLibrary from "expo-media-library";

export default function ImageGalleryScreen({ navigation, route }: any) {
  const { onSelect } = route.params || {};
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Cần quyền truy cập thư viện ảnh");
        navigation.goBack();
        return;
      }
      const album = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 100, // lấy 100 ảnh đầu tiên
        sortBy: [["creationTime", false]],
      });
      setPhotos(album.assets);
      setLoading(false);
    })();
  }, []);

  const handleConfirm = () => {
    if (!selected) return Alert.alert("Vui lòng chọn ảnh");
    onSelect && onSelect(selected); // gửi ảnh về màn trước
    navigation.goBack();
  };

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelected(item.uri)}
            style={{
              borderWidth: selected === item.uri ? 3 : 0,
              borderColor: "#facc15",
            }}
          >
            <Image
              source={{ uri: item.uri }}
              style={{ width: 120, height: 120, margin: 2 }}
            />
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        onPress={handleConfirm}
        className="bg-yellow-400 py-3 m-3 rounded-lg items-center"
      >
        <Text className="font-semibold text-black">Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
}
