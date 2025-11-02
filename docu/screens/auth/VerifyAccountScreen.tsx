import '../../global.css';
import { Alert, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import HeaderAuth from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import Button from '../../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import axios from 'axios';
import { path } from '../../config';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyAccountScreen'>;
  route: { params: { email: string } };
};

export default function VerifyAccountScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOTP = async () => {
    const otpTrim = otp.trim();
    if (!otpTrim) return Alert.alert('Vui lòng nhập mã OTP');
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${path}/auth/verify-otp`,
        { email: email.trim().toLowerCase(), otp: otpTrim },
        { timeout: 15000 }
      );
      Alert.alert(res.data?.message || 'Xác thực thành công');
      navigation.navigate('LoginScreen' as any);
    } catch (err: any) {
      Alert.alert(err?.response?.data?.message || 'Xác thực thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <View className="pl-5 pt-20">
        <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />
      <HeaderAuth value="Nhập mã xác thực email" />

      <View className="px-2 mt-10">
        <Text>Nhập mã OTP để xác nhận email</Text>
      </View>

      <View className="mt-5 px-2">
        <FloatingInput
          label="Mã OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="oneTimeCode"
          returnKeyType="done"
          onSubmitEditing={handleVerifyOTP}
        />
        <Button value="Xác nhận" onPress={handleVerifyOTP} loading={isLoading} disabled={isLoading || !otp.trim()} />
      </View>
    </View>
  );
}
