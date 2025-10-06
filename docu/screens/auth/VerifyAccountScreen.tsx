
import '../../global.css'
import { Text, View, TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Image } from 'react-native'
import { TextInput } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

import { useState } from 'react'
import FloatingInput from '../../components/FloatingInput'
import Button from '../../components/Button'
import HeaderAuth from '../../components/HeaderAuth';

export default function VerifyAccountScreen() {
    const [otp, setOtp] = useState("")
    return (
        <View className="">
            <View className="pl-5 pt-20">

                <FontAwesome name="arrow-left" size={20} color="#000" />
            </View>

            <StatusBar style="auto" />

            <HeaderAuth value="Nhập mã xác thực email" />
            <View className="px-2 mt-10">
                <Text>
                    Nhập Email để đặt lại mật khẩu của bạn
                </Text>
            </View>

            <View className="mt-5 px-2">
                <FloatingInput
                    label="Email"
                    value={otp}
                    onChangeText={setOtp}
                />

                <Button value="Xác nhận" />
            </View>
        </View>
    )


}