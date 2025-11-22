import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { path } from "../../../config"; // <-- IMPORT PATH
import { useNavigation, useRoute } from "@react-navigation/native";

export default function QRInviteScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { groupId } = route.params;
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("No token");
        const res = await axios.get(`${path}/groups/${groupId}/detail`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroupName(res.data.name || "Nhóm");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // TỰ ĐỘNG LẤY IP TỪ `path` → TẠO QR
    try {
      const url = new URL(path);
      const ip = url.hostname;
      console.log(groupId);
      setQrValue(`exp://${ip}:8081/--/join/${groupId}`);
    } catch {
      setQrValue(`exp://192.168.102.150:8081/--/join/${groupId}`); // fallback
    }

    fetchGroup();
  }, [groupId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mt-5">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 rounded-full bg-gray-100"
        >
          <Feather name="arrow-left" size={22} color="#000" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-semibold text-gray-800">
          Mã QR mời vào nhóm
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center w-full max-w-sm">
          <Text className="text-xl font-bold text-gray-800 mb-6">
            {groupName}
          </Text>
          <View className="p-4 bg-white rounded-xl border border-gray-200">
            <QRCode
              value={qrValue}
              size={220}
              color="#000"
              backgroundColor="#fff"
            />
          </View>
          <Text className="mt-6 text-sm text-gray-600 text-center px-4">
            Dùng <Text className="font-bold">camera điện thoại</Text> quét mã
            này để tham gia nhóm ngay!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
