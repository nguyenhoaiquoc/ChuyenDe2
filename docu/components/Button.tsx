import React from 'react';
import '../global.css';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

type ButtonProps = {
  value: string;
  onPress?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;                 // 👈 thêm prop disabled
  containerClassName?: string;        // (tuỳ chọn) bổ sung class ngoài
  textClassName?: string;             // (tuỳ chọn) bổ sung class chữ
};

export default function Button({
  value,
  onPress,
  loading = false,
  disabled = false,
  containerClassName,
  textClassName,
}: ButtonProps) {
  const isDisabled = loading || disabled; // 👈 gom logic khoá nút

  return (
    <TouchableOpacity
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`relative px-6 py-3 rounded-xl mt-5
        ${isDisabled ? 'bg-gray-400' : 'bg-blue-500'}
        ${containerClassName ?? ''}`}
    >
      {loading ? (
        <View className="flex-row justify-center items-center">
          <ActivityIndicator color="white" />
          <Text className={`text-white font-bold ml-2 ${textClassName ?? ''}`}>
            Đang xử lý...
          </Text>
        </View>
      ) : (
        <Text className={`text-center text-white font-bold ${textClassName ?? ''}`}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
}
