import '../../global.css';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import HeaderAuth from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import Button from '../../components/Button';

const pass = [
  "Mật khẩu mới",
  "Xác nhận mật khẩu mới"
];

export default function NewPasswordScreen() {
  const [values, setValues] = useState<string[]>(["", ""]);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false, false]);

  const togglePassword = (index: number) => {
    const newShow = [...showPasswords];
    newShow[index] = !newShow[index];
    setShowPasswords(newShow);
  };

  return (
    <View>
      <View className="pl-5 pt-20">
        <FontAwesome name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />
      <HeaderAuth value="Đặt lại mật khẩu" />

      <View className="px-2 mt-10">
        <Text>Nhập mật khẩu mới của bạn</Text>
      </View>

      <View className="mt-5 px-2">
        {pass.map((p, index) => (
          <FloatingInput
            key={index}
            label={p}
            value={values[index]}
            onChangeText={(text) => {
              const newValues = [...values];
              newValues[index] = text;
              setValues(newValues);
            }}
            secureTextEntry={!showPasswords[index]}
            toggleSecure={() => togglePassword(index)} 
          />
        ))}

        <Button value="Tiếp tục" />
      </View>
    </View>
  );
}
