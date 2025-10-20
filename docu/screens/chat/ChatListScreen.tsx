

import { Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import "../../global.css"
import Menu from '../../components/Menu';
import { ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

const data = [
    {
        name: "Hoài Quốc",
        content: "Điện thoại này... ",
        date: "28/9/2025 ",
        quanlity: "1",
        image: require("../../assets/TDC.jpg")
    },
    {
        name: "Gia Bảo",
        content: "Bạn Muốn mua... ",
        date: "26/9/2025 ",
        quanlity: "2",
        image: require("../../assets/655428.jpg")
    },
    {
        name: "Quý Lê ",
        content: "Cơm chay không cậu ơi",
        date: "25/9/2025 ",
        quanlity: "1",
        image: require("../../assets/TDC.jpg")
    },
    {
        name: "Hữu Dũng",
        content: "Mình muốn ăn kfc...",
        date: "Th7 ",
        quanlity: "5",
        image: require("../../assets/TDC.jpg")
    },
    {
        name: "Hữu Dũng",
        content: "Mình muốn ăn kfc...",
        date: "Th7 ",
        quanlity: "5",
        image: require("../../assets/TDC.jpg")
    },
    {
        name: "Hữu Dũng",
        content: "Mình muốn ăn kfc...",
        date: "Th7 ",
        quanlity: "5",
        image: require("../../assets/TDC.jpg")
    },
    {
        name: "Hữu Dũng",
        content: "Mình muốn ăn kfc...",
        date: "Th7 ",
        quanlity: "5",
        image: require("../../assets/TDC.jpg")
    },
    {
        name: "Hữu Dũng",
        content: "Mình muốn ăn kfc...",
        date: "Th7 ",
        quanlity: "5",
        image: require("../../assets/TDC.jpg")
    },
]

export default function ChatListScreen({ navigation }: Props) {
    return (
        <View className="flex-1 bg-[#f5f6fa]">
            <StatusBar style="auto" />

            <View className="flex flex-row justify-between mt-14 items-center px-5">
                <Text className="text-2xl font-bold">Chat</Text>
                <View className="flex flex-row gap-10 ">
                    <FontAwesome5
                        className=""
                        name="search"
                        size={20}
                        color="gray"
                        onPress={() => navigation.navigate("SearchScreen")}
                    />
                    <FontAwesome5
                        className=""
                        name="bars"
                        size={20}
                        color="gray"
                    />
                </View>
            </View>

            <View className="w-full h-[1px] bg-gray-300 mt-10"></View>

            <View className="flex flex-row justify-between px-5 my-5">
                <Text className="text-xl font-bold">Tất cả tin nhắn</Text>
                <Text className="text-xl font-bold" onPress={() => navigation.navigate("UnreadMessageScreen")}>Tin chưa đọc</Text>
            </View>

            <ScrollView className='flex-1' >
                <View className="mb-20" >
                    {data.map((d, i) => (
                        <TouchableOpacity key={i} className="flex flex-row mb-10 px-4" onPress={() => navigation.navigate("ChatRoomScreen")} >
                            <View >
                                <Image className="w-[46px] h-[46px] rounded-full "
                                    source={d.image}
                                /></View>
                            <View className="w-[88%] pl-2">
                                <View className="flex flex-row justify-between">
                                    <Text className="text-xl font-semidbold">{d.name}</Text>
                                    <Text className="bg-red-500 px-2.5 rounded-full py-1 text-white flex-end">{d.quanlity}</Text>
                                </View>
                                <View className="flex flex-row justify-between">
                                    <Text className="text-lg text-gray-500">{d.content}</Text>
                                    <Text className="text-lg text-gray-500">{d.date}</Text>
                                </View>
                            </View>

                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            {/* Menu dưới */}
            <Menu />
        </View>

    )
}