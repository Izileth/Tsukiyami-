import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const EmptyFeed = () => (
  <View className="items-center justify-center py-20">
    <Ionicons name="document-outline" size={64} color="#CCCCCC" />
    <Text className="text-black/50 text-base mt-4">
      Nenhum post encontrado
    </Text>
  </View>
);
