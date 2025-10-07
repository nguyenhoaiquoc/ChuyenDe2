import '../../global.css';
import { Alert, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import HeaderAuth from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import Button from '../../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';

const pass = ["Mật khẩu mới", "Xác nhận mật khẩu mới"];

type RouteParams = {
  token?: string;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewPasswordScreen'>;
};

export default function NewPasswordScreen({ navigation }: Props) {
  const route = useRoute();
  const { token } = route.params as RouteParams
const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<string[]>(["", ""]);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false, false]);



  const togglePassword = (index: number) => {
    const newShow = [...showPasswords];
    newShow[index] = !newShow[index];
    setShowPasswords(newShow);
  };
const handleResetPassword = async () => {
    if (!values[0] || !values[1]) return Alert.alert('Vui lòng nhập đầy đủ mật khẩu');
    if (values[0] !== values[1]) return Alert.alert('Mật khẩu không trùng khớp');

    try {
      setLoading(true);
      const res = await axios.post('http://192.168.100.149:3000/auth/reset-password', {
        token,
        newPassword: values[0],
      });
      Alert.alert(res.data.message);
      navigation.navigate('LoginScreen'); // quay về login
    } catch (err: any) {
      Alert.alert(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };
 

  return (
    <View>
      <View className="pl-5 pt-20">
        <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />
      <HeaderAuth value="Đặt lại mật khẩu" />

      <View className="px-2 mt-10">
        <Text>Nhập mật khẩu mới của bạn</Text>
      </View>

      <View className="mt-5 px-2">
        {pass.map((p, index) => (
          <FloatingInput
            key={index}
            label={p}
            value={values[index]}
            onChangeText={(text) => {
              const newValues = [...values];
              newValues[index] = text;
              setValues(newValues);
            }}
            secureTextEntry={!showPasswords[index]}
            toggleSecure={() => togglePassword(index)}
          />
        ))}

        <Button value="Tiếp tục"      onPress={handleResetPassword}/>
      </View>
    </View>
  );
}
