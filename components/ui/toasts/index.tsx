import React from 'react';
import { View, Text } from 'react-native';
import { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

interface CustomToastProps extends ToastConfigParams<any> {
  text1?: string;
  text2?: string;
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2, ...rest }: CustomToastProps) => (
    <View className="mx-6 bg-white rounded-2xl overflow-hidden shadow-lg" style={{ 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    }}>
      {/* Barra lateral minimalista */}
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-black" />
      
      <View className="flex-row items-start px-5 py-4 pl-6">
        {/* Ícone */}
        <View className="w-8 h-8 rounded-full bg-black justify-center items-center mr-3 mt-0.5">
          <Ionicons name="checkmark" size={18} color="#fff" />
        </View>
        
        {/* Conteúdo */}
        <View className="flex-1">
          {text1 && (
            <Text className="text-black font-bold text-[15px] leading-5 mb-0.5">
              {text1}
            </Text>
          )}
          {text2 && (
            <Text className="text-black/60 text-[13px] leading-5 mt-1">
              {text2}
            </Text>
          )}
        </View>
      </View>
    </View>
  ),

  error: ({ text1, text2, ...rest }: CustomToastProps) => (
    <View className="mx-6 bg-white rounded-2xl overflow-hidden shadow-lg" style={{ 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    }}>
      {/* Barra lateral vermelha */}
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
      
      <View className="flex-row items-start px-5 py-4 pl-6">
        {/* Ícone */}
        <View className="w-8 h-8 rounded-full bg-red-500 justify-center items-center mr-3 mt-0.5">
          <Ionicons name="close" size={18} color="#fff" />
        </View>
        
        {/* Conteúdo */}
        <View className="flex-1">
          {text1 && (
            <Text className="text-black font-bold text-[15px] leading-5 mb-0.5">
              {text1}
            </Text>
          )}
          {text2 && (
            <Text className="text-black/60 text-[13px] leading-5 mt-1">
              {text2}
            </Text>
          )}
        </View>
      </View>
    </View>
  ),

  info: ({ text1, text2, ...rest }: CustomToastProps) => (
    <View className="mx-6 bg-white rounded-2xl overflow-hidden shadow-lg" style={{ 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    }}>
      {/* Barra lateral cinza */}
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-gray-400" />
      
      <View className="flex-row items-start px-5 py-4 pl-6">
        {/* Ícone */}
        <View className="w-8 h-8 rounded-full bg-gray-400 justify-center items-center mr-3 mt-0.5">
          <Ionicons name="information" size={18} color="#fff" />
        </View>
        
        {/* Conteúdo */}
        <View className="flex-1">
          {text1 && (
            <Text className="text-black font-bold text-[15px] leading-5 mb-0.5">
              {text1}
            </Text>
          )}
          {text2 && (
            <Text className="text-black/60 text-[13px] leading-5 mt-1">
              {text2}
            </Text>
          )}
        </View>
      </View>
    </View>
  ),

  warning: ({ text1, text2, ...rest }: CustomToastProps) => (
    <View className="mx-6 bg-white rounded-2xl overflow-hidden shadow-lg" style={{ 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    }}>
      {/* Barra lateral amarela/laranja */}
      <View className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
      
      <View className="flex-row items-start px-5 py-4 pl-6">
        {/* Ícone */}
        <View className="w-8 h-8 rounded-full bg-yellow-500 justify-center items-center mr-3 mt-0.5">
          <Ionicons name="warning" size={18} color="#fff" />
        </View>
        
        {/* Conteúdo */}
        <View className="flex-1">
          {text1 && (
            <Text className="text-black font-bold text-[15px] leading-5 mb-0.5">
              {text1}
            </Text>
          )}
          {text2 && (
            <Text className="text-black/60 text-[13px] leading-5 mt-1">
              {text2}
            </Text>
          )}
        </View>
      </View>
    </View>
  ),
};