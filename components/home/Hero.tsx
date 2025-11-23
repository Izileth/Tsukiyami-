import React from 'react';
import { View, Text } from 'react-native';

export const Hero = () => (
  <View className="px-6 pt-8 pb-6 border-b border-gray-100">
    <Text className="text-4xl font-bold text-black mb-2 tracking-tight">
      Feed
    </Text>
    <Text className="text-base text-black/50">
      Explore as últimas publicações da comunidade
    </Text>
  </View>
);
