import React from 'react';
import { Text, View } from 'react-native';

interface StatCardProps {
  number: string;
  label: string;
}

export function StatCard({ number, label }: StatCardProps) {
  return (
    <View className="flex-1 items-center bg-white rounded-xl p-4 border border-gray-200">
      <Text className="text-black text-2xl font-bold mb-1">{number}</Text>
      <Text className="text-gray-500 text-xs uppercase tracking-wide">{label}</Text>
    </View>
  );
}
