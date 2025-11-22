import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import '@/global.css';
import '@/utils/polyfills'; // se tiver alias configurado

import { supabase } from '@/utils/supabase';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { PostsProvider } from '@/context/PostsContext';
import { CommentsProvider } from '@/context/CommentsContext';
import { ReactionsProvider } from '@/context/LikesContext';
import LoadingScreen from './_loading';
import GlobalHeader from '@/components/global-header';

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
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // This is where you would load fonts, assets, etc.
        // We also add a minimum delay to see the splash screen.
        await Promise.all([
          supabase.auth.getSession(), // Ensures session is loaded before AuthProvider tries
          new Promise(resolve => setTimeout(resolve, 10000)),
        ]);
      } catch (e) {
        console.warn('App preparation error:', e);
      } finally {
        setIsAppReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <AuthProvider>
      <ProfileProvider>
        <PostsProvider>
          <CommentsProvider>
            <ReactionsProvider>
                {!isSplashFinished ? (
                  <LoadingScreen
                    isAppReady={isAppReady}
                    onExitAnimationFinish={() => setIsSplashFinished(true)}
                  />
                ) : (
                  <>
                    <GlobalHeader />
                    <RootLayoutNav />
                  </>
                )}
            </ReactionsProvider>
          </CommentsProvider>
        </PostsProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
