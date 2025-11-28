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
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    // Wait for the session to be loaded
    if (loading) {
      return;
    }

    if (!session && !inAuthGroup) {
      // Redirect to the login page if the user is not signed in
      // and not on an auth page.
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect away from auth pages if the user is signed in.
      router.replace('/');
    }
  }, [session, loading, segments, router, inAuthGroup]);

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
  const { loading } = useAuth();
  const [isSplashAnimationComplete, setIsSplashAnimationComplete] = useState(false);

  // App is ready when the auth session loading is finished.
  const isAppReady = !loading;

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
