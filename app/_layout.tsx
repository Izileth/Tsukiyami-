import 'react-native-url-polyfill/auto';
import React, {  useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import '@/global.css';
import '@/utils/polyfills'; // se tiver alias configurado


import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { PostsProvider } from '@/context/PostsContext';
import { CommentsProvider } from '@/context/CommentsContext';
import { ReactionsProvider } from '@/context/LikesContext';

import GlobalHeader from '@/components/global-header';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/ui/toasts';

// Keep the native splash screen visible
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait for the session to be loaded
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'register';

    if (!session && !inAuthGroup) {
      // Redirect to the login page if the user is not signed in
      // and not on an auth page.
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      // Redirect away from auth pages if the user is signed in.
      router.replace('/');
    }
  }, [session, loading, segments, router]);

  return (
    <>
      <Stack initialRouteName={session ? 'index' : 'auth'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <ProfileProvider>
        <PostsProvider>
          <CommentsProvider>
            <ReactionsProvider>
              <GlobalHeader />
              <RootLayoutNav />
              <Toast config={toastConfig} />
            </ReactionsProvider>
          </CommentsProvider>
        </PostsProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
