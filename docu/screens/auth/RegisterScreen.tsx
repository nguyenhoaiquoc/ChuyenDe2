
import '../../global.css';
import { Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./LoginScreen";
import Button from '../../components/Button';
import Header_lg_reg from '../../components/HeaderAuth';
import { useState } from 'react';
import FloatingInput from '../../components/FloatingInput';
export default function RegisterScreen({navigation }: { navigation: any }) {
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

const [values, setValues] = useState<string[]>(["", "","","",""]);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false, false]);

  const togglePassword = (index: number) => {
    const newShow = [...showPasswords];
    newShow[index] = !newShow[index];
    setShowPasswords(newShow);
  };

    return (
               <View className="">
            <View className="pl-5 pt-20">

                <FontAwesome onPress={() => navigation.navigate("Login")} name="arrow-left" size={20} color="#000" />
            </View>

            <StatusBar style="auto" />

            
            <Header_lg_reg value="Đăng ký"/>
            <View className="mt-10 px-2" >
                
      {content.map((label, index) => {
      if (label === "Email" ||label === "Họ và tên" || label === "Số điện thoại" ) {
    
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
 {binding.map((b,index) => (
<View key={index} className="flex flex-row gap-2  mt-4">
            <FontAwesome name="check-circle" size={20} color="gray" />
<Text>{b}</Text>

</View>
    ))}


<Button value="Đăng ký"/>

<View className="flex flex-row gap-2 justify-center mt-5 items-center ">
    <View className="relative w-full h-[1px] bg-gray-300">
          <View className="absolute right-0 w-[8px] h-[8px] bg-gray-300 rounded-full -top-1"></View>

    </View>
   <Text className="text-[12px]">Đã có tài khoản?</Text>
             <Text className="text-blue-500 font-bold text-[12px]">Đăng nhập ngay</Text>
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