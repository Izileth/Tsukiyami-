import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{headerShown: false}}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Profile', presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
