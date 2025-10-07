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

export default function HomeAdminScreen({ navigation }: Props) {
    return (
        <View className="">
            <StatusBar style="auto" />
            <Text>Đây là trang Admin do tao tạo ra</Text>
        </View>
    )
}