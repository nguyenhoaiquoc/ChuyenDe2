import '../../global.css';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import Button from '../../components/Button';
import Header_lg_reg from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import { useState } from 'react';

export default function OTPVerifyScreen() {
  const [otp, setOtp] = useState("");

  return (
    <View>
      <View className="pl-5 pt-20">
        <FontAwesome name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />
      <Header_lg_reg value="Đặt lại mật khẩu" />

      <View className="px-2 mt-10">
        <Text>Nhập mã xác nhận</Text>
      </View>

      <View className="mt-5 px-2">
        <FloatingInput
          label="Mã OTP"
          value={otp}
          onChangeText={setOtp}
        />

  <Button value="Xác nhận" />
       
      </View>
     
    </View>
  );
}
