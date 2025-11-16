import React from 'react';
import '../global.css';
import { Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';

export default function Header_lg_reg({ value }: { value: string }) {
    return (
        <View className="flex flex-row mt-20 justify-between items-center px-2">
            <View>
                <Text className="text-3xl font-bold ">
                    {value}
                </Text>
            </View>
            <View>
                <Image className="w-[46px] h-[46px] rounded-full"
                    source={require('../assets/TDC.jpg')}
                />
            </View>
        </View>
    )
}