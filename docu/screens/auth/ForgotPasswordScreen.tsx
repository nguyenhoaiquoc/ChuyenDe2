
import '../../global.css';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Button from '../../components/Button';
import Header_lg_reg from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import axios from 'axios';
import { path } from '../../config';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>
}
export default function ForgotPasswordScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email) return Alert.alert('Vui lòng nhập email');

        try {
            setIsLoading(true);
            const res = await axios.post(`${path}/auth/forgot-password`, { email });
            Alert.alert(res.data.message);
            // Điều hướng sang màn OTPVerifyScreen kèm param email
            navigation.navigate('OTPVerifyScreen', { email });
        } catch (err: any) {
            Alert.alert(err.response?.data?.message || 'Gửi OTP thất bại');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <View className="">
            <View className="pl-5 pt-20" >

                <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
            </View>

            <StatusBar style="auto" />

            <Header_lg_reg value="Đặt lại mật khẩu" />
            <View className="px-2 mt-10">
                <Text>
                    Nhập Email để đặt lại mật khẩu của bạn
                </Text>
            </View>

            <View className="mt-5 px-2" >

                <View className="mt-5 px-2">
                    <FloatingInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Button value="Tiếp tục" onPress={handleSendOtp} loading={isLoading} />
                </View>
            </View>
        </View>
    )
}