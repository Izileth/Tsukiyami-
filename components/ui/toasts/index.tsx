
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ToastProps {
  text1?: string;
  text2?: string;
}
export const toastConfig = {
  success: (props: ToastProps) => (
    <View className="w-[100%]  bg-black  border-l border-white p-5 flex-row items-start shadow-2xl">
      <View className="bg-white rounded-full p-1.5 mt-0.5">
        <Feather name="check" size={16} color="#000000" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-white font-bold text-base mb-1">{props.text1}</Text>
        {props.text2 && (
          <Text className="text-neutral-400 text-sm leading-5">{props.text2}</Text>
        )}
      </View>
      <Feather name="x" size={18} color="#fff" className="ml-2" />
    </View>
  ),

  error: (props: ToastProps) => (
    <View className="w-[100%] bg-black border-l-4 border-neutral-300  p-5 flex-row items-start shadow-2xl">
      <View className="bg-neutral-300 rounded-full p-1.5 mt-0.5">
        <Feather name="x" size={16} color="#000000" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-white font-bold text-base mb-1">{props.text1}</Text>
        {props.text2 && (
          <Text className="text-neutral-400 text-sm leading-5">{props.text2}</Text>
        )}
      </View>
      <Feather name="x" size={18} color="#6B7280" className="ml-2" />
    </View>
  ),

  info: (props: ToastProps) => (
    <View className="w-[100%] bg-black border-l-4 border-neutral-500   p-5 flex-row items-start shadow-2xl">
      <View className="bg-neutral-500 rounded-full p-1.5 mt-0.5">
        <Feather name="info" size={16} color="#000000" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-white font-bold text-base mb-1">{props.text1}</Text>
        {props.text2 && (
          <Text className="text-neutral-400 text-sm leading-5">{props.text2}</Text>
        )}
      </View>
      <Feather name="x" size={18} color="#6B7280" className="ml-2" />
    </View>
  ),

  warning: (props: ToastProps) => (
    <View className="w-[100%] bg-black border-l-4 border-neutral-400  p-5 flex-row items-start shadow-2xl">
      <View className="bg-neutral-400 rounded-full p-1.5 mt-0.5">
        <Feather name="alert-triangle" size={16} color="#000000" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-white font-bold text-base mb-1">{props.text1}</Text>
        {props.text2 && (
          <Text className="text-neutral-400 text-sm leading-5">{props.text2}</Text>
        )}
      </View>
      <Feather name="x" size={18} color="#6B7280" className="ml-2" />
    </View>
  ),
};