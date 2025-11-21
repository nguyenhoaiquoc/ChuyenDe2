import '../../global.css';
import { Alert, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import Button from '../../components/Button';
import HeaderAuth from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { path } from '../../config';
import React from 'react';

type RouteParams = { email: string };
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTPVerifyScreen'>;
};

export default function OTPVerifyScreen({ navigation }: Props) {
  const route = useRoute();
  const { email } = route.params as RouteParams;

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleVerifyOtp = async () => {
    const otpTrim = otp.trim();
    if (!otpTrim) return Alert.alert('Vui lòng nhập OTP');

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${path}/auth/verify-reset-otp`,
        { email: email.trim().toLowerCase(), otp: otpTrim },
        { timeout: 15000 }
      );

      const resetToken = res?.data?.resetToken || res?.data?.token;
      if (!resetToken) throw new Error('Thiếu reset token từ server');

      Alert.alert(res.data?.message || 'OTP xác thực thành công');
      navigation.navigate('NewPasswordScreen' as any, { email: email.trim().toLowerCase(), token: resetToken });
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || 'Xác thực OTP thất bại');
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
      <HeaderAuth value="Đặt lại mật khẩu" />

      {loginError && (
        <View className="flex items-center px-2">
          <View className="flex-row gap-2 bg-red-100 py-4 justify-center w-full rounded-xl px-3">
            <FontAwesome name="warning" size={16} color="red" />
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
          onChangeText={(t) => { setLoginError(null); setOtp(t); }}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="oneTimeCode"
          returnKeyType="done"
          onSubmitEditing={handleVerifyOtp}
        />
        <Button value="Xác nhận" onPress={handleVerifyOtp} loading={isLoading} disabled={isLoading || !otp.trim()} />
      </View>
    </View>
  );
}
