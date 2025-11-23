import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileInfoCard } from './ProfileInfoCard';

interface UserProfile {
    first_name?: string;
    last_name?: string;
    location?: string;
    website?: string;
    birth_date?: string;
    updated_at?: string;
    social_media_links?: any;
}

interface ProfileDetailsProps {
  profile: UserProfile;
}

export const ProfileDetails = ({ profile }: ProfileDetailsProps) => {
  return (
    <View className="px-6 pb-6">
      <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">Profile Details</Text>

      {(profile.first_name || profile.last_name) && (
        <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <View className="bg-gray-100 p-3 rounded-lg mr-4">
              <Ionicons name="person-outline" size={20} color="#000000" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Full Name</Text>
              <Text className="text-black font-semibold text-base">
                {profile.first_name && profile.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.first_name || profile.last_name}
              </Text>
            </View>
          </View>
          {profile.first_name && (
            <View className="flex-row justify-between border-t border-gray-200 pt-3">
              <Text className="text-gray-500 text-xs uppercase tracking-wide">First Name</Text>
              <Text className="text-black text-sm font-medium">{profile.first_name}</Text>
            </View>
          )}
          {profile.last_name && (
            <View className="flex-row justify-between border-t border-gray-200 pt-3 mt-2">
              <Text className="text-gray-500 text-xs uppercase tracking-wide">Last Name</Text>
              <Text className="text-black text-sm font-medium">{profile.last_name}</Text>
            </View>
          )}
        </View>
      )}

      {profile.location && (
        <ProfileInfoCard
          icon="location-outline"
          label="Location"
          value={profile.location}
        />
      )}

      {profile.website && (
        <ProfileInfoCard
          icon="globe-outline"
          label="Website"
          value={profile.website}
        />
      )}

      {profile.birth_date && (
        <ProfileInfoCard
          icon="calendar-outline"
          label="Birth Date"
          value={new Date(profile.birth_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        />
      )}

      {profile.updated_at && (
        <ProfileInfoCard
          icon="refresh-outline"
          label="Last Updated"
          value={new Date(profile.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        />
      )}

      {profile.social_media_links && (
        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-gray-500 text-xs mb-3 uppercase tracking-wide">Social Media</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity className="bg-gray-100 p-3 rounded-lg">
              <Ionicons name="logo-twitter" size={20} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 p-3 rounded-lg">
              <Ionicons name="logo-instagram" size={20} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 p-3 rounded-lg">
              <Ionicons name="logo-linkedin" size={20} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 p-3 rounded-lg">
              <Ionicons name="logo-github" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
