import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
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
import LoadingScreen from './_loading';

// Keep the native splash screen visible
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';

  return (
    <>
      {!inAuthGroup && <GlobalHeader />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(post)" />
        <Stack.Screen name="(profile)" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

// Wrapper component to handle loading screen
function AppLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isSplashAnimationComplete, setIsSplashAnimationComplete] = useState(false);

  // App is ready when the auth session loading is finished.
  const isAppReady = !loading;

  useEffect(() => {
    if (!isAppReady || !isSplashAnimationComplete) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [isAppReady, isSplashAnimationComplete, session, segments, router]);


  if (!isSplashAnimationComplete) {
    return (
      <LoadingScreen
        isAppReady={isAppReady}
        onExitAnimationFinish={() => setIsSplashAnimationComplete(true)}
      />
    );
  }

  return (
    <>
      <RootLayoutNav />
      <Toast config={toastConfig} />
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
              <AppLayout />
            </ReactionsProvider>
          </CommentsProvider>
        </PostsProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
