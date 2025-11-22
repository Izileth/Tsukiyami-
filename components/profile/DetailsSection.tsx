import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Profile } from '@/context/ProfileContext';
import { ProfileInfoCard } from './ProfileInfoCard';

interface DetailsSectionProps {
  profile: Profile | null;
}

export function DetailsSection({ profile }: DetailsSectionProps) {
  const fullName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.first_name || profile?.last_name;
  const social = profile?.social_media_links;

  const hasSocialLinks =
    social &&
    (social.twitter ||
      social.instagram ||
      social.linkedin ||
      social.github);

  return (
    <View className="px-6 pb-6">
      <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">
        Profile Details
      </Text>

      {/* FULL NAME CARD */}
      {fullName && (
        <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <View className="bg-gray-100 p-3 rounded-lg mr-4">
              <Ionicons name="person-outline" size={20} color="#000000" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1 uppercase tracking-wide">
                Full Name
              </Text>
              <Text className="text-black font-semibold text-base">{fullName}</Text>
            </View>
          </View>

          {profile?.first_name && (
            <View className="flex-row justify-between border-t border-gray-200 pt-3">
              <Text className="text-gray-500 text-xs uppercase tracking-wide">First Name</Text>
              <Text className="text-black text-sm font-medium">{profile.first_name}</Text>
            </View>
          )}

          {profile?.last_name && (
            <View className="flex-row justify-between border-t border-gray-200 pt-3 mt-2">
              <Text className="text-gray-500 text-xs uppercase tracking-wide">Last Name</Text>
              <Text className="text-black text-sm font-medium">{profile.last_name}</Text>
            </View>
          )}
        </View>
      )}

      {/* OTHER INFO */}
      {profile?.location && (
        <ProfileInfoCard icon="location-outline" label="Location" value={profile.location} />
      )}

      {profile?.website && (
        <ProfileInfoCard icon="globe-outline" label="Website" value={profile.website} />
      )}

      {profile?.birth_date && (
        <ProfileInfoCard
          icon="calendar-outline"
          label="Birth Date"
          value={new Date(profile.birth_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        />
      )}

      {profile?.updated_at && (
        <ProfileInfoCard
          icon="refresh-outline"
          label="Last Updated"
          value={new Date(profile.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
      )}

      {/* =============================== */}
      {/*     SOCIAL LINKS (melhorado)    */}
      {/* =============================== */}

      {hasSocialLinks && (
        <View className="bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-gray-500 text-xs mb-3 uppercase tracking-wide">Social Media</Text>

          <View className="flex-row gap-3 flex-wrap">

            {social?.twitter && (
              <TouchableOpacity
                className="bg-gray-100 p-3 rounded-lg"
                onPress={() => Linking.openURL(social.twitter)}
              >
                <Ionicons name="logo-twitter" size={20} color="#000000" />
              </TouchableOpacity>
            )}

            {social?.instagram && (
              <TouchableOpacity
                className="bg-gray-100 p-3 rounded-lg"
                onPress={() => Linking.openURL(social.instagram)}
              >
                <Ionicons name="logo-instagram" size={20} color="#000000" />
              </TouchableOpacity>
            )}

            {social?.linkedin && (
              <TouchableOpacity
                className="bg-gray-100 p-3 rounded-lg"
                onPress={() => Linking.openURL(social.linkedin)}
              >
                <Ionicons name="logo-linkedin" size={20} color="#000000" />
              </TouchableOpacity>
            )}

            {social?.github && (
              <TouchableOpacity
                className="bg-gray-100 p-3 rounded-lg"
                onPress={() => Linking.openURL(social.github)}
              >
                <Ionicons name="logo-github" size={20} color="#000000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* OPCIONAL: Caso queira exibir uma mensagem */}
      {/* {!hasSocialLinks && (
        <View className="bg-white rounded-xl p-4 border border-gray-200 mt-3">
          <Text className="text-gray-500 text-xs uppercase tracking-wide mb-1">
            Social Media
          </Text>
          <Text className="text-gray-400 text-sm">
            Nenhuma rede social adicionada ainda.
          </Text>
        </View>
      )} */}
    </View>
  );
}
