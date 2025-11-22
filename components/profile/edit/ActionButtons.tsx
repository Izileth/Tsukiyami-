import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonsProps {
  isUpdating: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ActionButtons({ isUpdating, onSave, onCancel }: ActionButtonsProps) {
  return (
    <View className="mb-8 gap-3">
      <TouchableOpacity
        className={`w-full py-4 rounded-xl ${isUpdating ? 'bg-gray-400' : 'bg-black'}`}
        onPress={onSave}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator color="white" size="small" />
            <Text className="text-white font-bold ml-2">Saving Changes...</Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-center">
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Save Changes</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full py-4 rounded-xl border-2 border-gray-300"
        onPress={onCancel}
        disabled={isUpdating}
      >
        <Text className="text-black font-semibold text-center">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
