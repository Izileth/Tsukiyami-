import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileInfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
}

export function ProfileInfoCard({ icon, label, value }: ProfileInfoCardProps) {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row items-center">
        <View className="bg-gray-100 p-3 rounded-lg mr-4">
          <Ionicons name={icon} size={20} color="#000000" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs mb-1 uppercase tracking-wide">{label}</Text>
          <Text className="text-black font-semibold text-base">{value || 'Not set'}</Text>
        </View>
      </View>
    </View>
  );
}
