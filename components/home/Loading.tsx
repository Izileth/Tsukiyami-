import React from 'react';
import { View, Text, ActivityIndicator, SafeAreaView } from 'react-native';

export const Loading = () => (
  <SafeAreaView className="flex-1 bg-white">
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#000000" />
      <Text className="text-black/50 text-sm mt-4">Carregando posts...</Text>
    </View>
  </SafeAreaView>
);
