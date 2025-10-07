import '../global.css';
import { Text, TouchableOpacity } from 'react-native';

type ButtonProps = {
  value: string;
  onPress?: () => void; // thêm prop onPress
};

export default function Button({ value, onPress }: ButtonProps) {
  return (
    <TouchableOpacity
      className="bg-blue-500 px-6 py-3 rounded-xl mt-5"
      onPress={onPress} // gắn onPress vào TouchableOpacity
    >
      <Text className="text-center text-white font-bold">{value}</Text>
    </TouchableOpacity>
  );
}
