import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { Profile } from '@/context/ProfileContext';
import { EmptyAvatarIllustration, EmptyBannerIllustration } from './illustrations';

interface ProfileHeaderProps {
  profile: Profile | null;
  displayName: string;
  memberSince: string;
  uploading: boolean;
  onUpload: (bucket: 'avatars' | 'banners') => void;
}

const isValidUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const trimmedUrl = url.trim();
  return trimmedUrl.length > 0 && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'));
};

export function ProfileHeader({
  profile,
  displayName,
  memberSince,
  uploading,
  onUpload,
}: ProfileHeaderProps) {
  const hasAvatar = isValidUrl(profile?.avatar_url);
  const hasBanner = isValidUrl(profile?.banner_url);

  return (
    <>
      <TouchableOpacity onPress={() => onUpload('banners')} className="relative">
        {hasBanner ? (
          <Image
            key={profile?.banner_url}
            source={{ uri: profile!.banner_url }}
            className="h-48 w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-48 w-full bg-gray-50">
            <EmptyBannerIllustration />
          </View>
        )}
        <View className="absolute inset-0 items-center justify-center">
          {uploading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View className="rounded-full bg-white/90 p-4 border border-gray-200">
              <Ionicons name="camera-outline" size={28} color="black" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View className="-mt-14 mb-6 px-6">
        <View className="flex-row items-end justify-between">
          <TouchableOpacity onPress={() => onUpload('avatars')} className="relative">
            <View className="h-28 w-28 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden">
              {hasAvatar ? (
                <Image
                  key={profile?.avatar_url}
                  source={{ uri: profile!.avatar_url }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <EmptyAvatarIllustration />
              )}
            </View>
            <View className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-black p-2">
              <Ionicons name="camera" size={16} color="white" />
            </View>
            {profile?.role === 'ADM' && (
              <View className="absolute -top-1 -right-1 rounded-full border-2 border-white bg-black p-1.5">
                <Ionicons name="shield-checkmark" size={14} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-row gap-2">
            <Link href="/(post)/form" asChild>
              <TouchableOpacity
                className="rounded-full bg-blue-500 py-3 px-6"
              >
                <View className="flex-row items-center">
                  <Ionicons name="add" size={18} color="white" />
                  <Text className="ml-2 font-bold text-white">Nova Publicação</Text>
                </View>
              </TouchableOpacity>
            </Link>
            <Link href="/profile/edit" asChild>
              <TouchableOpacity className="rounded-full bg-black py-3 px-6">
                <View className="flex-row items-center">
                  <Ionicons name="create-outline" size={18} color="white" />
                  <Text className="ml-2 font-bold text-white">Editar Perfil</Text>
                </View>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View className="mt-4">
          <View className="flex-row flex-wrap items-center">
            <Text className="text-3xl font-bold text-black">{displayName}</Text>
            {profile?.role === 'ADM' && (
              <View className="ml-3 rounded-full bg-black px-3 py-1">
                <Text className="text-xs font-bold uppercase tracking-wide text-white">Adimin</Text>
              </View>
            )}
          </View>

          {profile?.slug && <Text className="mt-1 text-base text-gray-500">@{profile.slug}</Text>}
          {profile?.position && <Text className="mt-1 text-base font-medium text-black">{profile.position}</Text>}

          {profile?.email && (
            <View className="mt-2 flex-row items-center">
              <Ionicons name="mail-outline" size={14} color="#6B7280" />
              <Text className="ml-2 text-sm text-gray-500">{profile.email}</Text>
            </View>
          )}

          <Text className="mt-2 text-sm text-gray-400">Membro desde {memberSince}</Text>
        </View>

        {profile?.bio && (
          <View className="mt-4 border-l-2 border-l-gray-400 bg-transparent p-4">
            <Text className="leading-6 text-gray-700">{profile.bio}</Text>
          </View>
        )}
      </View>
    </>
  );
}
