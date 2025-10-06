import { Text, View, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image, TextInput } from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import { useState, useRef, useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';


type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, "ChatRoomScreen">;
};

export default function ChatRoomScreen({navigation}:Props) {
  const [messages, setMessages] = useState([
    { text: "Điện thoại này còn không", time: "10:37" },
    { text: "mày im chưa", time: "10:38" }
  ]);
  const [content, setContent] = useState("");

const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!content.trim()) return;
    const newMsg = {
      text: content,
      time: new Date().toLocaleTimeString().slice(0, 5)
    };
    setMessages([...messages, newMsg]);
    setContent("");
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />

      <View className="flex flex-row mt-14 items-center px-5 justify-between border-b border-gray-200 pb-2">
        <View className="flex flex-row items-center gap-4">
          <FontAwesome5 name="arrow-left" size={20} color="gray" onPress={() => navigation.goBack()}/>
          <View className="flex flex-row gap-2">
            <Image className="w-[46px] h-[46px] rounded-full"
              source={require("../../assets/TDC.jpg")}
            />
            <View>
              <Text>Hoài quốc</Text>
              <Text>Hoạt động 2 giờ trước</Text>
            </View>
          </View>
        </View>
        <FontAwesome5 name="bars" size={20} color="gray" />
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 10 }}
      >
        {messages.map((msg, index) => {
          if (index % 2 === 0) {
            return (
              <View key={index} className="flex flex-col gap-1 self-start mb-3">
                <Text className="bg-gray-200 px-3 py-3 rounded-xl self-start">
                  {msg.text}
                </Text>
                <Text>{msg.time}</Text>
              </View>
            );
          } else {
            return (
              <View key={index} className="flex flex-col gap-1 self-end mb-3">
                <Text className="bg-yellow-200 px-3 py-3 rounded-xl self-start">
                  {msg.text}
                </Text>
                <Text className="self-end">{msg.time}</Text>
              </View>
            );
          }
        })}
      </ScrollView>

      <KeyboardAvoidingView>
        <View className="pb-1 pt-4 px-5 w-full bg-gray-100 shadow-xl rounded-t-2xl">
          <View className="mb-2 relative">
            <TextInput
              className="w-full"
              value={content}
              onChangeText={setContent}
              placeholder="Nhập tin nhắn..."
            />
            <TouchableOpacity
              onPress={handleSend}
              className="absolute right-5 top-2 bg-blue-500 px-3 py-2 rounded-lg"
            >
              <Text className="text-white">Gửi</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row gap-4">
            <View className="flex flex-row bg-gray-300 px-4 py-2 rounded-full gap-2">
              <FontAwesome5 name="image" size={20} color="gray" />
              <TouchableOpacity>
                <Text>Hình ảnh và video</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-gray-300 px-4 py-2 rounded-full">
              <TouchableOpacity>
                <Text>Địa chỉ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
