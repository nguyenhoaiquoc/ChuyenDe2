
import '../../global.css';
import { Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from "@expo/vector-icons";
import Button from '../../components/Button';
import Header_lg_reg from '../../components/HeaderAuth';
import { useState } from 'react';
import FloatingInput from '../../components/FloatingInput';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import axios from 'axios';
import { Alert } from 'react-native';
import { path } from '../../config';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RegisterScreen'>
}
export default function RegisterScreen({ navigation }: Props) {

  const handleRegister = async () => {
    const [fullName, email, phone, password, confirmPassword] = values;

    // kiểm tra cơ bản
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    try {
      const res = await axios.post(`https://ttgb.id.vn/api/register`, {
         name: fullName,
        email,
        password,
        password_confirmation: confirmPassword,
        phone,
      });
      Alert.alert(res.data.message);
      navigation.navigate('VerifyAccountScreen', { email: values[1] });
    } catch (err: any) {
  setLoginError(err.response?.data?.message || 'Sai thông');
    }
  };

  const content = [
    "Họ và tên",
    "Email",
    "Số điện thoại",
    "Mật khẩu",
    "Xác nhận mật khẩu"

  ]
  const binding = [
    "Giới hạn 8-32 ký tự",
    "Tối thiểu 01 ký tự IN HOA",
    "Tối thiểu 01 ký tự in thường",
    "Tối thiểu 01 chữ số"

  ]

  const [values, setValues] = useState<string[]>(["", "", "", "", ""]);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false, false]);
const [loginError, setLoginError] = useState<string | null>(null);

  const togglePassword = (index: number) => {
    const newShow = [...showPasswords];
    newShow[index] = !newShow[index];
    setShowPasswords(newShow);
  };

  return (
    <View className="">
      <View className="pl-5 pt-14">

        <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />


      <Header_lg_reg value="Đăng ký" />
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
          if (label === "Email" || label === "Họ và tên" || label === "Số điện thoại") {

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
        {binding.map((b, index) => (
          <View key={index} className="flex flex-row gap-2  mt-4">
            <FontAwesome name="check-circle" size={20} color="gray" />
            <Text>{b}</Text>

          </View>
        ))}


        <Button value="Đăng ký" onPress={handleRegister} />

        <View className="flex flex-row gap-2 justify-center mt-5 items-center ">
          <View className="relative w-full h-[1px] bg-gray-300">
            <View className="absolute right-0 w-[8px] h-[8px] bg-gray-300 rounded-full -top-1"></View>

          </View>
          <Text className="text-[12px]">Đã có tài khoản?</Text>
          <Text className="text-blue-500 font-bold text-[12px]" onPress={() => navigation.navigate("LoginScreen")}>Đăng nhập ngay</Text>
          <View className="relative w-full h-[1px] bg-gray-300 ">
            <View className="absolute w-[8px] h-[8px] bg-gray-300 rounded-full -top-1"></View>
          </View>
        </View>

      </View>
      <View className="w-full h-[1px] bg-gray-300 mt-10"></View>
      <View className="flex flex-row gap-6 justify-center mt-5">

        <Text className="text-[12px] border-r pr-5 ">Cao Đẳng CN Thủ Đức</Text>
        <Text className="text-[12px] border-r pr-5">Chính sách bảo mật</Text>
        <Text className="text-[12px]">Liên hệ hỗ trợ</Text>
      </View>

    </View>
  )


}