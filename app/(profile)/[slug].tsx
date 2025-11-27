import React from 'react';
import { View, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { usePublicProfile } from '@/hooks/usePublicProfile';
import { ProfileHeader } from '@/components/profile/slug/ProfileHeader';
import { Stats } from '@/components/profile/slug/Stats';
import { UserPosts } from '@/components/profile/slug/UserPosts';
import { ProfileDetails } from '@/components/profile/slug/ProfileDetails';
import { useProfile } from '@/context/ProfileContext'; // Import useProfile

export default function PublicProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { profile, posts, loading, isFollowing, followerCount, followingCount, handleFollowToggle, followLoading } = usePublicProfile(slug);
  const { profile: currentUserProfile } = useProfile(); // Get authenticated user's profile

  if (loading || !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const displayName = profile.name ||
    (profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.first_name || profile.last_name || 'No Name');

  // Determine if the viewed profile belongs to the current authenticated user
  const isOwnProfile = currentUserProfile?.id === profile?.id;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style='light' />
      <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
        <ProfileHeader
          profile={profile}
          isFollowing={isFollowing}
          handleFollowToggle={handleFollowToggle}
          loading={followLoading}
          isOwnProfile={isOwnProfile} // Pass the calculated boolean
        />

        <Stats
          postsCount={posts.length}
          followerCount={followerCount}
          followingCount={followingCount}
        />

        <UserPosts
          posts={posts}
          displayName={displayName}
          loading={loading}
        />

        <ProfileDetails profile={profile} />
      </ScrollView>
    </SafeAreaView>
  );
}