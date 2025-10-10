import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import '../../global.css';
import { Image } from 'react-native';
import { TextInput } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { FontAwesome5 } from "@expo/vector-icons";
import Button from '../../components/Button';
import HeaderAuth from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { path } from '../../config';
import { Linking } from 'react-native';


const content = [
  "Email",
  "Mật khẩu"
]
type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}
export default function LoginScreen({ navigation }: Props) {
  const [values, setValues] = useState<string[]>(["", ""]);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false, false]);
const [loginError, setLoginError] = useState<string | null>(null);

  const togglePassword = (index: number) => {
    const newShow = [...showPasswords];
    newShow[index] = !newShow[index];
    setShowPasswords(newShow);
  };

const handleLogin = async () => {
  const [email, password] = values;

  if (!email || !password) {
    Alert.alert('Vui lòng nhập đầy đủ thông tin');
    return;
  }

  try {
    const res = await axios.post(`https://ttgb.id.vn/api/login`, {
      email,
      password,
    });
    Alert.alert('Đăng nhập thành công');

    // Lưu token nếu muốn
    await AsyncStorage.setItem('token', res.data.token);
    // console.log(res.data);
    
    
   if (res.data.role === 'Admin') {
  navigation.reset({
    index: 0,
    routes: [{ name: 'HomeAdminScreen' }],
  });
} else {
  navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });
}

  } catch (err: any) {
  setLoginError(err.response?.data?.message || 'Email hoặc mật khẩu chưa đúng \n vui lòng kiểm tra lại');
  }
};


  return (
    <View className="">
      <View className="pl-5 pt-20">

        <FontAwesome name="arrow-left" size={20} color="#000"   onPress={() => navigation.navigate("Home")}/>
      </View>

      <StatusBar style="auto" />

      <HeaderAuth value="Đăng nhập" />
{loginError && (
  <View className="flex items-center px-2">
    <View className="flex-row gap-2 bg-red-100 py-4 justify-center  w-full rounded-xl">
      <FontAwesome name="warning" className="mt-0.5" size={16} color="red" />
      <Text>{loginError}</Text>
    </View>
  </View>
)}


      <View className="mt-10 px-2" >

        {content.map((label, index) => {
          if (label === "Email") {

            return (
              <FloatingInput
                key={index}
                label={label}
                value={values[index]}
                onChangeText={(text) => {
                  const newValues = [...values];
                  newValues[index] = text;
                  setValues(newValues);
                }}

              />
            );
          } else {

            return (
              <FloatingInput
                key={index}
                label={label}
                value={values[index]}
                onChangeText={(text) => {
                  const newValues = [...values];
                  newValues[index] = text;
                  setValues(newValues);
                }}
                secureTextEntry={!showPasswords[index]}
                toggleSecure={() => togglePassword(index)}
              />
            );
          }
        })}

        <Text onPress={() => navigation.navigate("ForgotPasswordScreen")} className="font-thin text-[12px]">Quên mật khẩu?</Text>

        <Button value="Đăng nhập" onPress={handleLogin} />

        <View className="flex flex-row gap-2 justify-center mt-5 items-center ">
          <View className="relative w-full h-[1px] bg-gray-300">
            <View className="absolute right-0 w-[8px] h-[8px] bg-gray-300 rounded-full -top-1"></View>

          </View>
          <Text className="text-[12px]">Chưa có tài khoản?</Text>
          <Text onPress={() => navigation.navigate("RegisterScreen")} className="text-blue-500 font-bold text-[12px]">Đăng ký tài khoản mới</Text>
          <View className="relative w-full h-[1px] bg-gray-300 ">
            <View className="absolute w-[8px] h-[8px] bg-gray-300 rounded-full -top-1"></View>
          </View>
        </View>

      </View>
      <View className="w-full h-[1px] bg-gray-300 mt-10"></View>
      <View className="flex flex-row gap-6 justify-center mt-5">

        <Text className="text-[12px] border-r pr-5 ">Cao Đẳng CN Thủ Đức</Text>
        <Text className="text-[12px] border-r pr-5">Chính sách bảo mật</Text>
        <Text className="text-[12px]" onPress={() => Linking.openURL('https://ttgb.id.vn/')}>Liên hệ hỗ trợ</Text>
      </View>
    </View>
  );

}