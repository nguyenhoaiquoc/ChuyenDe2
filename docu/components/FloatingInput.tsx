import { useState } from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

type FloatingInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  toggleSecure?: () => void; 
};

export default function FloatingInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  toggleSecure,
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value.length > 0;

  return (
    <View className="mb-5 relative">
      <TextInput
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        className={`w-full h-[50px] px-5 rounded-xl transition-all duration-300 pb-1
          ${isActive ? "border-2 border-black" : "border border-gray-500"}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <View
        pointerEvents="none"
        className={`absolute flex flex-row transition-all duration-300
          ${isActive ? "top-1 left-5" : "top-4 left-5"}`}
      >
        <Text
          className={`font-bold transition-all duration-300 
            ${isActive ? "text-[10px]" : "text-[14px] text-gray-500"}`}
        >
          {label}
        </Text>
        <Text
          className={`text-[red] transition-all duration-300
            ${isActive ? "text-[10px] ml-1" : "text-[14px] ml-1"}`}
        >
          *
        </Text>
      </View>

  
      {toggleSecure && (
        <TouchableOpacity
          onPress={toggleSecure}
          className="absolute right-5 top-3"
        >
          <FontAwesome5
            name={secureTextEntry ? "eye-slash" : "eye"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
