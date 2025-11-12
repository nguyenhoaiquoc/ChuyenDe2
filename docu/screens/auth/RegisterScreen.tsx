import '../../global.css';
import { Text, View, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import Button from '../../components/Button';
import Header_lg_reg from '../../components/HeaderAuth';
import { useEffect, useState } from 'react';
import FloatingInput from '../../components/FloatingInput';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Group, RootStackParamList } from '../../types';
import axios from 'axios';
import { path } from '../../config';
import { Picker } from '@react-native-picker/picker';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RegisterScreen'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [values, setValues] = useState<string[]>(['', '', '', '', '']); // [fullName, email, phone, password, confirmPassword]
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false, false]); // [password, confirm]
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
axios.get(`${path}/groups/public`)
    .then(res => setGroups(res.data))
    .catch(err => console.error(err))
  },[])



  const [selectedGroup, setSelectedGroup] = useState("")


  const content = ['Họ và tên', 'Email', 'Số điện thoại', 'Mật khẩu', 'Xác nhận mật khẩu'];
  const binding = [
    'Giới hạn 8-32 ký tự',
    'Tối thiểu 01 ký tự IN HOA',
    'Tối thiểu 01 ký tự in thường',
    'Tối thiểu 01 chữ số',
  ];

  const togglePassword = (index: 0 | 1) => {
    setShowPasswords(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const setField = (index: number, text: string) => {
    if (loginError) setLoginError(null);
    const next = [...values];
    next[index] = text;
    setValues(next);
  };

  const handleRegister = async () => {
    if (isLoading) return;
    const [fullName, emailRaw, phoneRaw, password, confirmPassword] = values;
    const email = (emailRaw || '').trim().toLowerCase();
    const phone = (phoneRaw || '').trim();

    // kiểm tra cơ bản phía client
    if (!fullName?.trim() || !email || !password || !confirmPassword) {
      Alert.alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!email.endsWith('@fit.tdc.edu.vn')) {
      Alert.alert('Email không hợp lệ', 'Chỉ chấp nhận email sinh viên @fit.tdc.edu.vn');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${path}/auth/register`,
        { fullName: fullName.trim(), email, password, phone,group_id: selectedGroup },
        { timeout: 15000 },
      );
      Alert.alert(res.data?.message || 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh.');
      navigation.navigate('VerifyAccountScreen', { email });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      setLoginError(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1">
      <View className="pl-5 pt-14">
        <FontAwesome onPress={() => navigation.goBack()} name="arrow-left" size={20} color="#000" />
      </View>

      <StatusBar style="auto" />
      <Header_lg_reg value="Đăng ký" />

      {loginError && (
        <View className="flex items-center px-2">
          <View className="flex-row gap-2 bg-red-100 py-4 justify-center w-full rounded-xl px-3">
            <FontAwesome name="warning" size={16} color="red" />
            <Text>{loginError}</Text>
          </View>
        </View>
      )}

      <View className="mt-10 px-2">
        {content.map((label, index) => {
          const isPassword = index === 3 || index === 4;
          const pwToggleIdx = index - 3; // 3 -> 0, 4 -> 1
          return (
            <FloatingInput
              key={index}
              label={label}
              value={values[index]}
              onChangeText={(text: string) => setField(index, text)}
              secureTextEntry={isPassword ? !showPasswords[pwToggleIdx as 0 | 1] : false}
              toggleSecure={
                isPassword ? () => togglePassword(pwToggleIdx as 0 | 1) : undefined
              }
              // gợi ý input cho email/phone
              keyboardType={label === 'Email' ? 'email-address' : label === 'Số điện thoại' ? 'phone-pad' : 'default'}
              autoCapitalize={label === 'Email' ? 'none' : 'sentences'}
              autoCorrect={label === 'Email' || isPassword ? false : true}
            />
            
          );
        })}
             {/*dropdow chon khoa */}
        <View className="mt-4">
          <Text className="mb-1 font-semibold">Khoa</Text>
          <View className="border border-gray-300 rounded-lg overflow-hidden">
            <Picker
              selectedValue={selectedGroup}
              onValueChange={(value) => setSelectedGroup(value)}
            >
              {groups.map(group => (
                <Picker.Item key = {group.id} label={group.name} value={group.id}/>
              ))}
            </Picker>
          </View>
        </View>

        {binding.map((b, index) => (
          <View key={index} className="flex flex-row gap-2 mt-4">
            <FontAwesome name="check-circle" size={20} color="gray" />
            <Text>{b}</Text>
          </View>
        ))}

        <Button value="Đăng ký" onPress={handleRegister} loading={isLoading} />

        <View className="flex flex-row gap-2 justify-center mt-5 items-center ">
          <View className="relative w-full h-[1px] bg-gray-300">
            <View className="absolute right-0 w-[8px] h-[8px] bg-gray-300 rounded-full -top-1" />
          </View>
          <Text className="text-[12px]">Đã có tài khoản?</Text>
          <Text
            className="text-blue-500 font-bold text-[12px]"
            onPress={() => navigation.navigate('LoginScreen')}
          >
            Đăng nhập ngay
          </Text>
          <View className="relative w-full h-[1px] bg-gray-300 ">
            <View className="absolute w-[8px] h-[8px] bg-gray-300 rounded-full -top-1" />
          </View>
        </View>
      </View>

      <View className="w-full h-[1px] bg-gray-300 mt-10" />
      <View className="flex flex-row gap-6 justify-center mt-5">
        <Text className="text-[12px] border-r pr-5 ">Cao Đẳng CN Thủ Đức</Text>
        <Text className="text-[12px] border-r pr-5">Chính sách bảo mật</Text>
        <Text className="text-[12px]">Liên hệ hỗ trợ</Text>
      </View>
    </ScrollView>
  );
}
