import React from 'react';
import { View, Text } from 'react-native';

interface EditFormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function EditFormSection({ title, children }: EditFormSectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">{title}</Text>
      {children}
    </View>
  );
}
