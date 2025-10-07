
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



type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyAccountScreen'>;
  route: { params: { email: string } };
  
}
export default function VerifyAccountScreen({ navigation,route  }: Props) {
  const { email } = route.params; // lấy email truyền từ RegisterScreen
    const [otp, setOtp] = useState("")

const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Vui lòng nhập mã OTP');
      return;
    }

    try {
      const res = await axios.post('http://192.168.100.149:3000/auth/verify-otp', {
        email,
        otp,
      });
      Alert.alert(res.data.message);
      navigation.navigate('LoginScreen'); // sau khi xác thực thành công
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