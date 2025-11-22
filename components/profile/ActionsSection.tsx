import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionsSectionProps {
  onLogout: () => void;
}

export function ActionsSection({ onLogout }: ActionsSectionProps) {
  return (
    <View className="px-6 pb-6">
      <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">Actions</Text>
      <TouchableOpacity
        onPress={onLogout}
        className="bg-white border border-gray-300 rounded-lg p-4 flex-row items-center justify-center mb-3"
      >
        <Ionicons name="log-out-outline" size={20} color="#000000" />
        <Text className="text-black font-bold ml-2">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
