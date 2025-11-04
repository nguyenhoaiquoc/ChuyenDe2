import { StatusBar } from 'expo-status-bar';
<<<<<<< HEAD
import { Text, View, TouchableOpacity, Alert } from 'react-native';
=======
import { Text, View, Alert, Linking } from 'react-native';
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
import { FontAwesome } from '@expo/vector-icons';
import '../../global.css';
import { useState } from 'react';
import Button from '../../components/Button';
import HeaderAuth from '../../components/HeaderAuth';
import FloatingInput from '../../components/FloatingInput';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { path } from '../../config';
<<<<<<< HEAD
import { Linking } from 'react-native';


const content = [
  "Email",
  "Mật khẩu"
]
type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>
}
export default function LoginScreen({ navigation }: Props) {
  const [values, setValues] = useState<string[]>(["", ""]);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false, false]);
const [loginError, setLoginError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
=======

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064

  const setEmailSafe = (t: string) => {
    if (loginError) setLoginError(null);
    setEmail(t);
  };
<<<<<<< HEAD

const handleLogin = async () => {
  if (isLoading) return; // tránh spam

  const [email, password] = values;
  if (!email || !password) {
    Alert.alert('Vui lòng nhập đầy đủ thông tin');
    return;
  }

  try {
    setIsLoading(true);
    const res = await axios.post(`${path}:3000/auth/login`, { email, password });
    Alert.alert('Đăng nhập thành công');
    await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userName', res.data.fullName);

    if (res.data.role === 'Admin') {
      navigation.reset({ index: 0, routes: [{ name: 'HomeAdminScreen' }] });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  } catch (err: any) {
    setLoginError(err.response?.data?.message || 'Email hoặc mật khẩu chưa đúng \n vui lòng kiểm tra lại');
  } finally {
    setIsLoading(false);
  }
};

=======
  const setPasswordSafe = (t: string) => {
    if (loginError) setLoginError(null);
    setPassword(t);
  };

  const handleLogin = async () => {
    if (isLoading) return;

    const emailTrim = (email || '').trim().toLowerCase();
    const passwordTrim = (password || '').trim();

    if (!emailTrim || !passwordTrim) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    // Nếu FE muốn khớp rule domain
    if (!emailTrim.endsWith('@fit.tdc.edu.vn')) {
      Alert.alert('Email không hợp lệ', 'Chỉ chấp nhận email @fit.tdc.edu.vn');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${path}/auth/login`,
        { email: emailTrim, password: passwordTrim },
        { timeout: 15000 }
      );
      console.log(res.data);
      const data = res.data || {};
      const accessToken = data.accessToken || data.token; // linh hoạt tên trường
      console.log(accessToken)
      if (!accessToken) {
        throw new Error('Thiếu access token trong phản hồi.');
      }

      await AsyncStorage.setItem('token', accessToken);
      if (data.fullName) await AsyncStorage.setItem('userName', String(data.fullName));
      if (data.id != null) await AsyncStorage.setItem('userId', String(data.id));
      if (data.role) await AsyncStorage.setItem('role', String(data.role));

      Alert.alert('Đăng nhập thành công');

      if (String(data.role).toLowerCase() === 'admin') {
        navigation.reset({ index: 0, routes: [{ name: 'HomeAdminScreen' as any }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (err: any) {
      // Ưu tiên message từ server
      const raw = err?.response?.data?.message ?? err?.message ?? 'Đăng nhập thất bại';
      const msg = Array.isArray(raw) ? raw.join('\n') : String(raw);

      // Nếu tài khoản chưa xác thực → điều hướng Verify
      const lower = msg.toLowerCase();
      const unverified =
        lower.includes('chưa xác thực') ||
        lower.includes('unverified') ||
        lower.includes('verify');

      if (unverified) {
        setLoginError(msg);
        // điều hướng kèm email để user chỉ cần nhập OTP
        navigation.navigate('VerifyAccountScreen' as any, { email: (email || '').trim().toLowerCase() });
      } else {
        setLoginError(msg || 'Email hoặc mật khẩu chưa đúng.\nVui lòng kiểm tra lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064

  return (
    <View className="">
      <View className="pl-5 pt-20">
<<<<<<< HEAD

        <FontAwesome name="arrow-left" size={20} color="#000"   onPress={() => navigation.navigate("Home")}/>
=======
        <FontAwesome
          name="arrow-left"
          size={20}
          color="#000"
          onPress={() => navigation.navigate('Home')}
        />
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
      </View>

      <StatusBar style="auto" />
      <HeaderAuth value="Đăng nhập" />

<<<<<<< HEAD
      <HeaderAuth value="Đăng nhập" />
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

      <View className="mt-10 px-2">
        {/* Email */}
        <FloatingInput
          label="Email"
          value={email}
          onChangeText={setEmailSafe}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
        />

        {/* Password */}
        <FloatingInput
          label="Mật khẩu"
          value={password}
          onChangeText={setPasswordSafe}
          secureTextEntry={!showPassword}
          toggleSecure={() => setShowPassword(v => !v)}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          autoComplete="password"
          onSubmitEditing={handleLogin}
          returnKeyType="done"
        />

        <Text
          onPress={() => navigation.navigate('ForgotPasswordScreen' as any)}
          className="font-thin text-[12px]"
        >
          Quên mật khẩu?
        </Text>

<<<<<<< HEAD
            return (
              <FloatingInput
                key={index}
                label={label}
                value={values[index]}
                onChangeText={(text) => {
                  const newValues = [...values];
                  newValues[index] = text;
                  setValues(newValues);
                }}

              />
            );
          } else {

            return (
              <FloatingInput
                key={index}
                label={label}
                value={values[index]}
                onChangeText={(text) => {
                  const newValues = [...values];
                  newValues[index] = text;
                  setValues(newValues);
                }}
                secureTextEntry={!showPasswords[index]}
                toggleSecure={() => togglePassword(index)}
              />
            );
          }
        })}

        <Text onPress={() => navigation.navigate("ForgotPasswordScreen")} className="font-thin text-[12px]">Quên mật khẩu?</Text>

        <Button value="Đăng nhập" onPress={handleLogin} loading={isLoading} />
=======
        <Button value="Đăng nhập" onPress={handleLogin} loading={isLoading} disabled={isLoading} />
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064

        <View className="flex flex-row gap-2 justify-center mt-5 items-center ">
          <View className="relative w-full h-[1px] bg-gray-300">
            <View className="absolute right-0 w-[8px] h-[8px] bg-gray-300 rounded-full -top-1" />
          </View>

          <Text className="text-[12px]">Chưa có tài khoản?</Text>
<<<<<<< HEAD
          <Text onPress={() => navigation.navigate("RegisterScreen")} className="text-blue-500 font-bold text-[12px]">Đăng ký tài khoản mới</Text>
=======
          <Text
            onPress={() => navigation.navigate('RegisterScreen' as any)}
            className="text-blue-500 font-bold text-[12px]"
          >
            Đăng ký tài khoản mới
          </Text>

>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
          <View className="relative w-full h-[1px] bg-gray-300 ">
            <View className="absolute w-[8px] h-[8px] bg-gray-300 rounded-full -top-1" />
          </View>
        </View>
      </View>

      <View className="w-full h-[1px] bg-gray-300 mt-10" />
      <View className="flex flex-row gap-6 justify-center mt-5">
        <Text className="text-[12px] border-r pr-5 ">Cao Đẳng CN Thủ Đức</Text>
        <Text className="text-[12px] border-r pr-5">Chính sách bảo mật</Text>
<<<<<<< HEAD
        <Text className="text-[12px]" onPress={() => Linking.openURL('https://ttgb.id.vn/')}>Liên hệ hỗ trợ</Text>
=======
        <Text className="text-[12px]" onPress={() => Linking.openURL('https://ttgb.id.vn/')}>
          Liên hệ hỗ trợ
        </Text>
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
      </View>
    </View>
  );
}
