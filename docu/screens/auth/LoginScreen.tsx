import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import '../../global.css';
import { Image } from 'react-native';
import { TextInput } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { FontAwesome5 } from "@expo/vector-icons";
import Button from '../../components/Button';
import Header_lg_reg from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';

const content = [
  "Email",
  "Mật khẩu"
]

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [values, setValues] = useState<string[]>(["", ""]);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false, false]);

  const togglePassword = (index: number) => {
    const newShow = [...showPasswords];
    newShow[index] = !newShow[index];
    setShowPasswords(newShow);
  };
  return (
    <View className="">
      <View className="pl-5 pt-20">

        <FontAwesome name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />

      <Header_lg_reg value="Đăng nhập" />


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

        <Text onPress={() => navigation.navigate("Inputemail")} className="font-thin text-[12px]">Quên mật khẩu?</Text>

        <Button value="Đăng nhập" />

        <View className="flex flex-row gap-2 justify-center mt-5 items-center ">
          <View className="relative w-full h-[1px] bg-gray-300">
            <View className="absolute right-0 w-[8px] h-[8px] bg-gray-300 rounded-full -top-1"></View>

          </View>
          <Text className="text-[12px]">Chưa có tài khoản?</Text>
          <Text onPress={() => navigation.navigate("Register")} className="text-blue-500 font-bold text-[12px]">Đăng ký tài khoản mới</Text>
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
  );

}