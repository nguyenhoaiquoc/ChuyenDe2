import '../../global.css';
import { Alert, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import Button from '../../components/Button';
import Header_lg_reg from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { path } from '../../config';

type RouteParams = {
  email: string;
};
type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'OTPVerifyScreen'>
}
export default function OTPVerifyScreen({ navigation }: Props) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
const [loginError, setLoginError] = useState<string | null>(null);

  const route = useRoute();
  const { email } = route.params as RouteParams;
const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert('Vui lòng nhập OTP');

    try {
      setLoading(true);
      const res = await axios.post(`https://ttgb.id.vn/api/verify-reset-otp`, {
        email,
        otp,
      });

      Alert.alert(res.data.message || 'OTP xác thực thành công');

      // Điều hướng sang màn NewPasswordScreen kèm token reset
      navigation.navigate('NewPasswordScreen', { token: res.data.resetToken });
    } catch (err: any) {
  setLoginError(err.response?.data?.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View>
      <View className="pl-5 pt-20">
        <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />
      <Header_lg_reg value="Đặt lại mật khẩu" />
{loginError && (
  <View className="flex items-center px-2">
    <View className="flex-row gap-2 bg-red-100 py-4 justify-center  w-full rounded-xl">
      <FontAwesome name="warning" className="mt-0.5" size={16} color="red" />
      <Text>{loginError}</Text>
    </View>
  </View>
)}
      <View className="px-2 mt-10">
        <Text>Nhập mã xác nhận</Text>
      </View>

      <View className="mt-5 px-2">
        <FloatingInput
          label="Mã OTP"
          value={otp}
          onChangeText={setOtp}
        />

  <Button value="Xác nhận"  onPress={handleVerifyOtp}/>
       
      </View>
     
    </View>
  );
}
