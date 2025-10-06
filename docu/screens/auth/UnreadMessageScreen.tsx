import { Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { TextInput } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from "@expo/vector-icons";
import "../../global.css"
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}

export default function UnreadMessageScreen({ navigation }: Props) {
    const data = [
        {
            name: "Hoài Quốc",
            content: "Điện thoại này còn không...",
            date: "28/9/2025",
            quanlity: "1",
            image: require("../../assets/TDC.jpg")
        },
        {
            name: "Gia Bảo",
            content: "Bạn Muốn biết thêm thông tin gì...",
            date: "26/9/2025",
            quanlity: "2",
            image: require("../../assets/655428.jpg")
        },
        {
            name: "Quý Lê",
            content: "Cơm chay không cậu ơi",
            date: "25/9/2025",
            quanlity: "1",
            image: require("../../assets/TDC.jpg")
        },
        {
            name: "Hữu Dũng",
            content: "Mình muốn ăn kfc...",
            date: "Th7",
            quanlity: "5",
            image: require("../../assets/TDC.jpg")
        },
    ]
    return (
        <View className=" ">
            <StatusBar style="auto" />
            <View className="flex flex-row justify-between px-5 mt-14 items-center border-b border-gray-200 pb-5">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Feather name="arrow-left" size={22} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">
                    Tin chưa đọc
                </Text>
                <FontAwesome5 name="search" size={20} color="gray" className="pr-5" onPress={() => navigation.navigate("SearchScreen")} />
            </View>

            <View className="">
                {data.map((d, i) => (
                    <View key={i} className="flex flex-row py-5 px-4 border-b border-gray-200 ">
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
                    </View>
                ))}
            </View>
        </View>
    )
}