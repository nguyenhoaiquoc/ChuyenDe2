import { Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TextInput } from 'react-native';
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import "../../global.css"
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}

export default function SearchScreen({ navigation }: Props) {
    return (
        <View className="">
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
            <View className="flex flex-row items-center gap-4 px-3 ml-2 mr-10 border mt-5 border-gray-200 rounded-xl">
                <FontAwesome5 name="search" size={20} color="gray" />
                <TextInput className="" placeholder='Nhập 3 ký tự cần tìm kiếm ' />
            </View>
        </View>
    )
}