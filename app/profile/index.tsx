import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView, Image } from 'react-native';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/utils/supabase';
import { useStorage } from '@/hooks/use-storage';
import { usePosts, Post } from '@/context/PostsContext';
import BottomSheet from '@/components/ui/bottom-sheet';
import PostForm from '@/components/post-form';

import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';


// Ilustração SVG para Banner vazio
const EmptyBannerIllustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 400 192" fill="none">
    <Rect width="400" height="192" fill="#FAFAFA" />
    <Path
      d="M120 96L140 76L160 96L180 66L200 86L220 66L240 86L260 66L280 96"
      stroke="#E5E5E5"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Circle cx="140" cy="60" r="8" fill="#E5E5E5" />
    <Path
      d="M180 120H220M180 130H240M180 140H210"
      stroke="#E5E5E5"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Ilustração SVG para Avatar vazio
const EmptyAvatarIllustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 112 112" fill="none">
    <Circle cx="56" cy="56" r="56" fill="#FAFAFA" />
    <Circle cx="56" cy="45" r="18" fill="#E5E5E5" />
    <Path
      d="M25 85C25 70 38 58 56 58C74 58 87 70 87 85"
      stroke="#E5E5E5"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
);

const ProfileInfoCard = ({ 
  icon, 
  label, 
  value 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  value?: string | null 
}) => (
  <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
    <View className="flex-row items-center">
      <View className="bg-gray-100 p-3 rounded-lg mr-4">
        <Ionicons name={icon} size={20} color="#000000" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs mb-1 uppercase tracking-wide">{label}</Text>
        <Text className="text-black font-semibold text-base">
          {value || 'Not set'}
        </Text>
      </View>
    </View>
  </View>
);

const StatCard = ({ 
  number, 
  label 
}: { 
  number: string; 
  label: string 
}) => (
  <View className="flex-1 items-center bg-white rounded-xl p-4 border border-gray-200">
    <Text className="text-black text-2xl font-bold mb-1">{number}</Text>
    <Text className="text-gray-500 text-xs uppercase tracking-wide">{label}</Text>
  </View>
);

export default function ProfileScreen() {
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { uploading, uploadImage } = useStorage();
  const { posts, loading: postsLoading, deletePost } = usePosts();
  const [isSheetVisible, setSheetVisible] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);

  const handleUpload = (bucket: 'avatars' | 'banners') => {
    uploadImage(bucket, async (url) => {
      const updates = bucket === 'avatars' ? { avatar_url: url } : { banner_url: url };
      try {
        await updateProfile(updates);
        Alert.alert('Success', 'Image uploaded successfully!');
      } catch (error: any) {
        Alert.alert('Error', `Failed to update profile: ${error.message}`);
      }
    });
  };

  if (uploading || profileLoading || postsLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const memberSince = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';

  const displayName = profile?.name || 
    (profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}` 
      : profile?.first_name || profile?.last_name || 'No Name');

  // Validação mais robusta para URLs
  const isValidUrl = (url?: string | null): boolean => {
    if (!url) return false;
    const trimmedUrl = url.trim();
    return trimmedUrl.length > 0 && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'));
  };

  const hasAvatar = isValidUrl(profile?.avatar_url);
  const hasBanner = isValidUrl(profile?.banner_url);

  console.log('Has Valid Avatar:', hasAvatar, 'URL:', profile?.avatar_url);
  console.log('Has Valid Banner:', hasBanner, 'URL:', profile?.banner_url);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style='light' />
      <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <TouchableOpacity  onPress={() => handleUpload('banners')} className="relative">
          {hasBanner ? (
            <Image
              key={profile?.banner_url}
              source={{ uri: profile?.banner_url }}
              style={{ width: '100%', height: 192 }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-48 bg-gray-50">
              <EmptyBannerIllustration />
            </View>
          )}
          <View className="absolute inset-0 justify-center items-center">
            {uploading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View className="bg-white/90 p-4 rounded-full border border-gray-200">
                <Ionicons name="camera-outline" size={28} color="black" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Profile Header */}
        <View className="px-6 -mt-14 mb-6">
          <View className="flex-row justify-between items-end">
            {/* Avatar */}
            <TouchableOpacity 
              onPress={() => handleUpload('avatars')} 
              className="relative"
            >
              <View className="rounded-full border-4 border-white shadow-sm bg-white">
                {hasAvatar ? (
                  <Image
                    key={profile?.avatar_url}
                    source={{ uri: profile?.avatar_url }}
                    style={{ width: 112, height: 112, borderRadius: 56 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-28 h-28 rounded-full overflow-hidden">
                    <EmptyAvatarIllustration />
                  </View>
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-black p-2 rounded-full border-2 border-white">
                <Ionicons name="camera" size={16} color="white" />
              </View>
              {profile?.role === 'ADM' && (
                <View className="absolute -top-1 -right-1 bg-black p-1.5 rounded-full border-2 border-white">
                  <Ionicons name="shield-checkmark" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Action Buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="bg-blue-500 rounded-full py-3 px-6"
                onPress={() => {
                  setSelectedPost(null);
                  setSheetVisible(true);
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="add" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">New Post</Text>
                </View>
              </TouchableOpacity>
              <Link href="/profile/edit" asChild>
                <TouchableOpacity className="bg-black rounded-full py-3 px-6">
                  <View className="flex-row items-center">
                    <Ionicons name="create-outline" size={18} color="white" />
                    <Text className="text-white font-bold ml-2">Edit Profile</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Name & Position */}
          <View className="mt-4">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-black text-3xl font-bold">
                {displayName}
              </Text>
              {profile?.role === 'ADM' && (
                <View className="bg-black px-3 py-1 rounded-full ml-3">
                  <Text className="text-white text-xs font-bold uppercase tracking-wide">Admin</Text>
                </View>
              )}
            </View>
            
            {profile?.slug && (
              <Text className="text-gray-500 text-base mt-1">
                @{profile.slug}
              </Text>
            )}
            
            {profile?.position && (
              <Text className="text-black text-base font-medium mt-1">
                {profile.position}
              </Text>
            )}
            
            {profile?.email && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="mail-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-2">{profile.email}</Text>
              </View>
            )}
            
            <Text className="text-gray-400 text-sm mt-2">
              Member since {memberSince}
            </Text>
          </View>

          {/* Bio */}
          {profile?.bio && (
            <View className="mt-4 bg-transparent p-4 border-l-2 border-l-gray-400">
              <Text className="text-gray-700 leading-6">{profile.bio}</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <StatCard number={posts.filter(p => p.user_id === profile?.id).length.toString()} label="Posts" />
            <StatCard number="0" label="Followers" />
            <StatCard number="0" label="Following" />
          </View>
        </View>

        {/* My Posts Section */}
        <View className="px-6 mb-6">
          <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">My Posts</Text>
          {postsLoading ? (
            <ActivityIndicator />
          ) : (
            posts.filter(p => p.user_id === profile?.id).map(p => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  setSelectedPost(p);
                  setSheetVisible(true);
                }}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-black font-bold text-lg">{p.title}</Text>
                    <Text className="text-gray-500 mt-1">{p.description}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deletePost(p.id)} className="p-2">
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
          {posts.filter(p => p.user_id === profile?.id).length === 0 && !postsLoading && (
            <Text className="text-gray-500 text-center">No posts yet.</Text>
          )}
        </View>

        {/* Details Section */}
        <View className="px-6 pb-6">
          <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">Profile Details</Text>
          
          {(profile?.first_name || profile?.last_name) && (
            <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
              <View className="flex-row items-center mb-3">
                <View className="bg-gray-100 p-3 rounded-lg mr-4">
                  <Ionicons name="person-outline" size={20} color="#000000" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Full Name</Text>
                  <Text className="text-black font-semibold text-base">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile?.first_name || profile?.last_name}
                  </Text>
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
          
          {profile?.location && (
            <ProfileInfoCard 
              icon="location-outline" 
              label="Location" 
              value={profile.location} 
            />
          )}
          
          {profile?.website && (
            <ProfileInfoCard 
              icon="globe-outline" 
              label="Website" 
              value={profile.website} 
            />
          )}
          
          {profile?.birth_date && (
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

          {profile?.updated_at && (
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

          {profile?.social_media_links && (
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

        {/* Actions Section */}
        <View className="px-6 pb-6">
          <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">Actions</Text>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white border border-gray-300 rounded-lg p-4 flex-row items-center justify-center mb-3"
          >
            <Ionicons name="log-out-outline" size={20} color="#000000" />
            <Text className="text-black font-bold ml-2">Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="bg-black rounded-lg p-4 flex-row items-center justify-center"
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text className="text-white font-bold ml-2">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomSheet visible={isSheetVisible} onClose={() => setSheetVisible(false)}>
        <PostForm
          post={selectedPost}
          onClose={() => {
            setSheetVisible(false);
            setSelectedPost(null);
          }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

function handleLogout() {
  supabase.auth.signOut();
}

function handleDeleteAccount() {
  Alert.alert(
    'Delete Account',
    'Are you sure you want to delete your account? This action is irreversible.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { data, error } = await supabase.functions.invoke('delete-user', {
              method: 'POST',
            });
            if (error) {
              throw error;
            }
            Alert.alert('Success', 'Your account has been deleted.');
            supabase.auth.signOut();
          } catch (error: any) {
            Alert.alert('Error', `Failed to delete account: ${error.message}`);
          }
        },
      },
    ]
  );
}