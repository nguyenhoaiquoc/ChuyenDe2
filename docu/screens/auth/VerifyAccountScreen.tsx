
import '../../global.css'
import { Text, View, TouchableOpacity, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Image } from 'react-native'
import { TextInput } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { useState } from 'react'
import FloatingInput from '../../components/FloatingInput'
import Button from '../../components/Button'
import HeaderAuth from '../../components/HeaderAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types'
import axios from 'axios'
import { path } from '../../config'



type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyAccountScreen'>;
  route: { params: { email: string } };
  
}
export default function VerifyAccountScreen({ navigation,route  }: Props) {
  const { email } = route.params; // lấy email truyền từ RegisterScreen
    const [otp, setOtp] = useState("")

const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Vui lòng nhập mã OTP');
      return;
    }

    try {
      const res = await axios.post(`https://ttgb.id.vn/api/verify-otp`, {
        email: email.trim(),
        code: otp.trim(), // loại bỏ khoảng trắng
      });
      Alert.alert(res.data.message);
      navigation.navigate('LoginScreen');
    } catch (err: any) {
      Alert.alert(err.response?.data?.message || 'Xác thực thất bại');
    }
};


    return (
        <View className="">
            <View className="pl-5 pt-20">

                <FontAwesome name="arrow-left" size={20} color="#000" />
            </View>

            <StatusBar style="auto" />

            <HeaderAuth value="Nhập mã xác thực email" />
            <View className="px-2 mt-10">
                <Text>
                    Nhập mã OTP để xác nhận email
                </Text>
            </View>

            <View className="mt-5 px-2">
                <FloatingInput
                    label="Mã OTP"
                    value={otp}
                    onChangeText={setOtp}
                />

        <Button value="Xác nhận" onPress={handleVerifyOTP} />
            </View>
        </View>
    )
}