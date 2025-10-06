
import '../global.css';
import { Text, View, TouchableOpacity } from 'react-native';

export default function Button({value}) {

    return (
      <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-xl mt-5" >
                    <Text className="text-center text-white font-bold">{value}</Text>
          </TouchableOpacity>
    )
}