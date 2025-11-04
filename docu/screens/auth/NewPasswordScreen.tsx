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
import { path } from '../../config';

<<<<<<< HEAD
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
const [isLoading, setIsLoading] = useState(false);
const [loginError, setLoginError] = useState<string | null>(null);

  const [values, setValues] = useState<string[]>(["", ""]);
=======
type RouteParams = { email?: string; token?: string };
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NewPasswordScreen'>;
};

const reqs = ['8–32 ký tự', 'Tối thiểu 1 IN HOA', 'Tối thiểu 1 in thường', 'Tối thiểu 1 chữ số'];

export default function NewPasswordScreen({ navigation }: Props) {
  const route = useRoute();
  const { email, token } = (route.params as RouteParams) || {};

  const [values, setValues] = useState<string[]>(['', '']); // [newPw, confirmPw]
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false, false]);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);



  const togglePassword = (index: number) => {
    setShowPasswords((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleResetPassword = async () => {
    const newPw = values[0];
    const confirm = values[1];
    if (!newPw || !confirm) return Alert.alert('Vui lòng nhập đầy đủ mật khẩu');
    if (newPw !== confirm) return Alert.alert('Mật khẩu không trùng khớp');

    // gợi ý validate tối thiểu ở FE (BE vẫn kiểm chuẩn)
    const okLen = newPw.length >= 8 && newPw.length <= 32;
    const hasUpper = /[A-Z]/.test(newPw);
    const hasLower = /[a-z]/.test(newPw);
    const hasDigit = /\d/.test(newPw);
    if (!(okLen && hasUpper && hasLower && hasDigit)) {
      return Alert.alert('Mật khẩu chưa đạt yêu cầu', reqs.join('\n'));
    }

    try {
      if (!email || !token) throw new Error('Thiếu email hoặc token');
      setIsLoading(true);
      const res = await axios.post(
        `${path}/auth/reset-password`,
        {
          email: email.trim().toLowerCase(), // ✅ gửi email theo spec BE
          token,
          newPassword: newPw,
        },
        { timeout: 15000 }
      );
      Alert.alert(res.data?.message || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' as any }] });
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || 'Mật khẩu chưa phù hợp');
    } finally {
      setIsLoading(false);
    }
  };
const handleResetPassword = async () => {
    if (!values[0] || !values[1]) return Alert.alert('Vui lòng nhập đầy đủ mật khẩu');
    if (values[0] !== values[1]) return Alert.alert('Mật khẩu không trùng khớp');

    try {
      setIsLoading(true)
      const res = await axios.post(`${path}:3000/auth/reset-password`, {
        token,
       newPassword: values[0],


      });
      Alert.alert(res.data.message);
      navigation.navigate('LoginScreen'); // quay về login
    } catch (err: any) {
  setLoginError(err.response?.data?.message || 'Mật khẩu chưa phù hợp');
    } finally {
      setIsLoading(false)
    }
  };
 

  return (
    <View>
      <View className="pl-5 pt-20">
        <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />
      <HeaderAuth value="Đặt lại mật khẩu" />
<<<<<<< HEAD
{loginError && (
  <View className="flex items-center px-2">
    <View className="flex-row gap-2 bg-red-100 py-4 justify-center  w-full rounded-xl">
      <FontAwesome name="warning" className="mt-0.5" size={16} color="red" />
      <Text>{loginError}</Text>
    </View>
  </View>
)}
=======

      {loginError && (
        <View className="flex items-center px-2">
          <View className="flex-row gap-2 bg-red-100 py-4 justify-center w-full rounded-xl px-3">
            <FontAwesome name="warning" size={16} color="red" />
            <Text>{loginError}</Text>
          </View>
        </View>
      )}

>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
      <View className="px-2 mt-10">
        <Text>Nhập mật khẩu mới của bạn</Text>
        {email ? <Text className="text-xs text-gray-500 mt-1">Email: {email}</Text> : null}
      </View>

      <View className="mt-5 px-2">
<<<<<<< HEAD
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

        <Button value="Tiếp tục" onPress={handleResetPassword} loading={isLoading}/>
=======
        <FloatingInput
          label="Mật khẩu mới"
          value={values[0]}
          onChangeText={(t) => { setLoginError(null); setValues(([_, b]) => [t, b]); }}
          secureTextEntry={!showPasswords[0]}
          toggleSecure={() => togglePassword(0)}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="password-new"
        />
        <FloatingInput
          label="Xác nhận mật khẩu mới"
          value={values[1]}
          onChangeText={(t) => { setLoginError(null); setValues(([a, _]) => [a, t]); }}
          secureTextEntry={!showPasswords[1]}
          toggleSecure={() => togglePassword(1)}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          autoComplete="password-new"
          returnKeyType="done"
          onSubmitEditing={handleResetPassword}
        />

        <View className="mt-2">
          <Text className="text-[12px] text-gray-600">Yêu cầu mật khẩu:</Text>
          {reqs.map((r, i) => (
            <Text key={i} className="text-[12px] text-gray-600">• {r}</Text>
          ))}
        </View>

        <Button
          value="Tiếp tục"
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={isLoading || !values[0] || !values[1]}
        />
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
      </View>
    </View>
  );
}
