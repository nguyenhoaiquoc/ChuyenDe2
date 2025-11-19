import React from "react";
import { View, ActivityIndicator } from "react-native";

export default function DeepLinkHandlerScreen() {
  return (
    <View className="flex-1 bg-gray-100 justify-center items-center">
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
