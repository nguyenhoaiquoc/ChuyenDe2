import '../global.css';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

type ButtonProps = {
  value: string;
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
    >
      {loading ? (
        <View className="flex-row justify-center items-center">
          <ActivityIndicator color="white" />
          <Text className="text-white font-bold ml-2">Đang xử lý...</Text>
        </View>
      ) : (
        <Text className="text-center text-white font-bold">{value}</Text>
      )}
    </TouchableOpacity>
  );
}
