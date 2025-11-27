import React from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ActionsSection } from '@/components/profile/ActionsSection';
import { DetailsSection } from '@/components/profile/DetailsSection';
import { PostsSection } from '@/components/profile/PostsSection';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatsSection } from '@/components/profile/StatsSection';
import { usePosts } from '@/context/PostsContext';
import { Profile, useProfile } from '@/context/ProfileContext';
import { useStorage } from '@/hooks/use-storage';
import { supabase } from '@/utils/supabase';
import Toast from 'react-native-toast-message';
function handleLogout() {
  supabase.auth.signOut();
  Toast.show({
    type: 'success',
    text1: 'Logout realizado com sucesso',
    position: 'top',
    visibilityTime: 5000,
  })
}

export default function ProfileScreen() {
  const { profile, loading: profileLoading, followerCount, followingCount, updateProfile } = useProfile();
  const { uploading, uploadImage } = useStorage();
  const { posts, loading: postsLoading, deletePost } = usePosts();

  const handleUpload = (bucket: 'avatars' | 'banners') => {
    uploadImage(bucket, async (url) => {
      const updates = bucket === 'avatars' ? { avatar_url: url } : { banner_url: url };
      try {
        await updateProfile(updates as Partial<Profile>);
        Alert.alert('Success', 'Image uploaded successfully!');
      } catch (error: any) {
        Alert.alert('Error', `Failed to update profile: ${error.message}`);
      }
    });
  };

  if (uploading || profileLoading || postsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Unknown';

  const displayName =
    profile?.name ||
    (profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.first_name || profile?.last_name || 'No Name');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ProfileHeader
          profile={profile}
          displayName={displayName}
          memberSince={memberSince}
          uploading={uploading}
          onUpload={handleUpload}
        />

        <StatsSection
          posts={posts}
          userId={profile?.id}
          followerCount={followerCount}
          followingCount={followingCount}
        />

        <PostsSection
          posts={posts}
          userId={profile?.id}
          isLoading={postsLoading}
          onDeletePost={deletePost}
        />
        <DetailsSection profile={profile} />

        <ActionsSection onLogout={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

