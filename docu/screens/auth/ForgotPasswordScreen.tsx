
import '../../global.css';
import { Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';
import { TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Button from '../../components/Button';
import Header_lg_reg from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import { useState } from 'react';

export default function ForgotPasswordScreen({ navigation }: { navigation: any }) {
    const [email, setEmail] = useState("");
    return (
        <View className="">
            <View className="pl-5 pt-20" >

                <FontAwesome onPress={() => navigation.navigate("Login")} name="arrow-left" size={20} color="#000" />
            </View>

            <StatusBar style="auto" />

            <Header_lg_reg value="Đặt lại mật khẩu" />
            <View className="px-2 mt-10">
                <Text>
                    Nhập Email để đặt lại mật khẩu của bạn
                </Text>
            </View>

            <View className="mt-5 px-2" >

                <View className="mt-5 px-2">
                    <FloatingInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Button value="Tiếp tục" />

                </View>
            </View>
        </View>
    )
}