import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}

export function FormField({ label, icon, children }: FormFieldProps) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center mb-3">
        <View className="bg-gray-100 p-2 rounded-lg mr-3">
          <Ionicons name={icon} size={16} color="#000000" />
        </View>
        <Text className="text-black text-sm font-semibold uppercase tracking-wide">{label}</Text>
      </View>
      {children}
    </View>
  );
}
