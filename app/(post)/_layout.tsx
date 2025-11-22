import { Stack } from 'expo-router';
import React from 'react';

export default function PostLayout() {
  return (
    <Stack>
      <Stack.Screen name="[slug]" options={{ headerShown: false }} />
      <Stack.Screen name="form" options={{ headerShown: false, animation: 'slide_from_right', }} />
    </Stack>
  );
}
