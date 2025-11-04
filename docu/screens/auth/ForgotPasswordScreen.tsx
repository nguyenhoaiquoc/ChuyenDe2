import '../../global.css';
<<<<<<< HEAD
import { Text, View, TouchableOpacity, Alert } from 'react-native';
=======
import { Text, View, Alert } from 'react-native';
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
import { StatusBar } from 'expo-status-bar';
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
<<<<<<< HEAD
    navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>
}
export default function ForgotPasswordScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
      const [isLoading, setIsLoading] = useState(false);

const handleSendOtp = async () => {
    if (!email) return Alert.alert('Vui lòng nhập email');

    try {
        setIsLoading(true);
      const res = await axios.post(`${path}:3000/auth/forgot-password`, { email });
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
=======
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064

  const onChangeEmail = (t: string) => setEmail(t);

  const handleSendOtp = async () => {
    if (isLoading) return;

    const emailTrim = (email || '').trim().toLowerCase();
    if (!emailTrim) {
      Alert.alert('Vui lòng nhập email');
      return;
    }
    // Nếu BE chỉ chấp nhận domain @fit.tdc.edu.vn, FE nên chặn sớm
    if (!emailTrim.endsWith('@fit.tdc.edu.vn')) {
      Alert.alert('Email không hợp lệ', 'Chỉ chấp nhận email @fit.tdc.edu.vn');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(
        `${path}/auth/forgot-password`,
        { email: emailTrim },
        { timeout: 15000 }
      );
      // Anti-enumeration: luôn báo thông điệp trung tính
      Alert.alert('Nếu email hợp lệ, mã OTP đặt lại đã được gửi.');
      // Điều hướng sang màn xác thực OTP reset, kèm email
      navigation.navigate('VerifyResetOtpScreen' as any, { email: emailTrim });
    } catch (err: any) {
      // Dù lỗi gì cũng nên giữ thông điệp trung tính để tránh lộ tồn tại email
      Alert.alert('Nếu email hợp lệ, mã OTP đặt lại đã được gửi.');
      navigation.navigate('VerifyResetOtpScreen' as any, { email: emailTrim });
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
                    <Button value="Tiếp tục" onPress ={handleSendOtp} loading={isLoading}/>
=======
  const canSubmit = !!email.trim() && !isLoading;
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064

  return (
    <View>
      <View className="pl-5 pt-20">
        <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />
      <Header_lg_reg value="Đặt lại mật khẩu" />

      <View className="px-2 mt-10">
        <Text>Nhập Email để đặt lại mật khẩu của bạn</Text>
      </View>

      <View className="mt-5 px-2">
        <FloatingInput
          label="Email"
          value={email}
          onChangeText={onChangeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="done"
          onSubmitEditing={handleSendOtp}
        />

        <Button
          value="Tiếp tục"
          onPress={handleSendOtp}
          loading={isLoading}
          disabled={!canSubmit}
        />
      </View>
    </View>
  );
}
