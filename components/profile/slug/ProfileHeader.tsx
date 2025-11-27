import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyBannerIllustration, EmptyAvatarIllustration } from './Illustrations';

import { UserProfile } from '@/types';

interface ProfileHeaderProps {
  profile: UserProfile;
  isFollowing: boolean;
  handleFollowToggle: () => void;
  loading: boolean;
  isOwnProfile?: boolean; // Nova prop para identificar se é o próprio perfil
}

const isValidUrl = (url?: string | null): boolean => {
    if (!url) return false;
    const trimmedUrl = url.trim();
    return trimmedUrl.length > 0 && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'));
};

export const ProfileHeader = ({ 
  profile, 
  isFollowing, 
  handleFollowToggle, 
  loading,
  isOwnProfile = false // Default false
}: ProfileHeaderProps) => {
  const hasAvatar = isValidUrl(profile.avatar_url);
  const hasBanner = isValidUrl(profile.banner_url);
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';

  const displayName = profile.name ||
    (profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.first_name || profile.last_name || 'No Name');

  return (
    <>
      {/* Banner */}
      {hasBanner ? (
        <Image
          key={profile.banner_url}
          source={{ uri: profile.banner_url }}
          style={{ width: '100%', height: 192 }}
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-48 bg-gray-50">
          <EmptyBannerIllustration />
        </View>
      )}

      {/* Profile Header */}
      <View className="px-6 -mt-14 mb-6">
        <View className="flex-row justify-between items-end">
          {/* Avatar */}
          <View className="relative">
            <View className="rounded-full border-4 border-white shadow-sm bg-white">
              {hasAvatar ? (
                <Image
                  key={profile.avatar_url}
                  source={{ uri: profile.avatar_url }}
                  style={{ width: 112, height: 112, borderRadius: 56 }}
                  resizeMode="cover"
                />
              ) : (
                <View className="w-28 h-28 rounded-full overflow-hidden">
                  <EmptyAvatarIllustration />
                </View>
              )}
            </View>
            {profile.role === 'ADM' && (
              <View className="absolute -top-1 -right-1 bg-black p-1.5 rounded-full border-2 border-white">
                <Ionicons name="shield-checkmark" size={14} color="white" />
              </View>
            )}
          </View>

          {/* Follow/Unfollow Button - Só aparece se NÃO for o próprio perfil */}
          {!isOwnProfile && (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`rounded-full py-3 px-6 ${isFollowing ? 'bg-gray-300' : 'bg-blue-500'}`}
                onPress={handleFollowToggle}
                disabled={loading}
              >
                <View className="flex-row items-center">
                  <Ionicons 
                    name={isFollowing ? "checkmark-outline" : "person-add-outline"} 
                    size={18} 
                    color={isFollowing ? "black" : "white"} 
                  />
                  <Text className={`font-bold ml-2 ${isFollowing ? 'text-black' : 'text-white'}`}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Name & Position */}
        <View className="mt-4">
          <View className="flex-row items-center flex-wrap">
            <Text className="text-black text-3xl font-bold">
              {displayName}
            </Text>
            {profile.role === 'ADM' && (
              <View className="bg-black px-3 py-1 rounded-full ml-3">
                <Text className="text-white text-xs font-bold uppercase tracking-wide">Admin</Text>
              </View>
            )}
          </View>

          {profile.slug && (
            <Text className="text-gray-500 text-base mt-1">
              @{profile.slug}
            </Text>
          )}

          {profile.position && (
            <Text className="text-black text-base font-medium mt-1">
              {profile.position}
            </Text>
          )}

          {profile.email && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="mail-outline" size={14} color="#6B7280" />
              <Text className="text-gray-500 text-sm ml-2">{profile.email}</Text>
            </View>
          )}

          <Text className="text-gray-400 text-sm mt-2">
            Membro desde {memberSince}
          </Text>
        </View>

        {/* Bio */}
        {profile.bio && (
          <View className="mt-4 bg-transparent p-4 border-l-2 border-l-gray-400">
            <Text className="text-gray-700 leading-6">{profile.bio}</Text>
          </View>
        )}
      </View>
    </>
  );
};