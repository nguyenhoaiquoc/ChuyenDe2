<<<<<<< HEAD
=======
import React from 'react';
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
import '../global.css';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

type ButtonProps = {
  value: string;
<<<<<<< HEAD
  onPress?: () => void;
  loading?: boolean;
};

export default function Button({ value, onPress, loading = false }: ButtonProps) {
  return (
    <TouchableOpacity
      disabled={loading}
      className={`relative px-6 py-3 rounded-xl mt-5 ${
        loading ? 'bg-gray-400' : 'bg-blue-500'
      }`}
      onPress={onPress}
=======
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
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
    >
      {loading ? (
        <View className="flex-row justify-center items-center">
          <ActivityIndicator color="white" />
<<<<<<< HEAD
          <Text className="text-white font-bold ml-2">Đang xử lý...</Text>
        </View>
      ) : (
        <Text className="text-center text-white font-bold">{value}</Text>
=======
          <Text className={`text-white font-bold ml-2 ${textClassName ?? ''}`}>
            Đang xử lý...
          </Text>
        </View>
      ) : (
        <Text className={`text-center text-white font-bold ${textClassName ?? ''}`}>
          {value}
        </Text>
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
      )}
    </TouchableOpacity>
  );
}
