import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView, Image } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useLocalSearchParams } from 'expo-router'; // To get the slug from the URL
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// --- Interfaces for Post and its related types ---
export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface PostImage {
  id: number;
  image_url: string;
}

export interface Post {
  id: number;
  user_id: string;
  title: string;
  content: string;
  description: string;
  slug: string;
  likes_count: number;
  views_count: number;
  dislikes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  post_images: PostImage[];
  categories: Category[];
  tags: Tag[];
}

// --- SVG Illustrations (Keep as they are generic) ---
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

// --- ProfileInfoCard and StatCard (Keep as they are generic) ---
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

// --- New Profile Type for fetched profile data ---
interface UserProfile {
  id: string;
  avatar_url?: string;
  banner_url?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  slug?: string;
  position?: string;
  email?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  website?: string;
  location?: string;
  birth_date?: string;
  social_media_links?: any; // Define a proper type if needed
  role?: string;
}

export default function PublicProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    async function fetchProfileAndPosts() {
      if (!slug) return;

      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (profileError || !profileData) {
          console.error('Error fetching profile:', profileError);
          Alert.alert('Error', 'Could not load profile.');
          setLoading(false);
          return;
        }
        setProfile(profileData);

        // Fetch posts for this profile
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            post_images(image_url),
            post_categories(categories(id, name)),
            post_tags(tags(id, name))
          `)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (postsError) {
          console.error('Error fetching posts:', postsError);
          // Don't block if posts fail, just show what we have
        } else {
          // Flatten the categories and tags structure
          const formattedPosts = postsData?.map((p: any) => ({
            ...p,
            categories: p.post_categories?.map((pc: any) => pc.categories) || [],
            tags: p.post_tags?.map((pt: any) => pt.tags) || [],
          })) || [];
          setPosts(formattedPosts);
        }

        // Check if current user is following this profile
        const { data: userData } = await supabase.auth.getSession();
        if (userData?.session?.user) {
          const { data: followData, error: followError } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', userData.session.user.id)
            .eq('following_id', profileData.id);

          if (followError) {
            console.error('Error checking follow status:', followError);
          } else {
            setIsFollowing(followData && followData.length > 0);
          }
        }
        
        // Fetch follower count
        const { count: followers, error: followersError } = await supabase
          .from('follows')
          .select('*', { count: 'exact' })
          .eq('following_id', profileData.id);
        
        if (!followersError) {
          setFollowerCount(followers || 0);
        }

        // Fetch following count
        const { count: following, error: followingError } = await supabase
          .from('follows')
          .select('*', { count: 'exact' })
          .eq('follower_id', profileData.id);
        
        if (!followingError) {
          setFollowingCount(following || 0);
        }

      } catch (error: any) {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndPosts();
  }, [slug]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    setLoading(true); // Indicate action is in progress

    try {
      const { data: userData } = await supabase.auth.getSession();
      const currentUserId = userData?.session?.user?.id;

      if (!currentUserId) {
        Alert.alert('Authentication Required', 'You must be logged in to follow users.');
        setLoading(false);
        return;
      }

      if (currentUserId === profile.id) {
        Alert.alert('Action Not Allowed', 'You cannot follow yourself.');
        setLoading(false);
        return;
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.id);

        if (error) {
          throw error;
        }
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1); // Decrement count
        Alert.alert('Success', `You unfollowed ${profile.name || profile.slug}`);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: currentUserId, following_id: profile.id });

        if (error) {
          throw error;
        }
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1); // Increment count
        Alert.alert('Success', `You are now following ${profile.name || profile.slug}`);
      }
    } catch (error: any) {
      console.error('Follow/Unfollow error:', error);
      Alert.alert('Error', `Failed to update follow status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (loading || !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';

  const displayName = profile.name ||
    (profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.first_name || profile.last_name || 'No Name');

  const isValidUrl = (url?: string | null): boolean => {
    if (!url) return false;
    const trimmedUrl = url.trim();
    return trimmedUrl.length > 0 && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'));
  };

  const hasAvatar = isValidUrl(profile.avatar_url);
  const hasBanner = isValidUrl(profile.banner_url);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style='light' />
      <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
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

            {/* Follow/Unfollow Button */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`rounded-full py-3 px-6 ${isFollowing ? 'bg-gray-300' : 'bg-blue-500'}`}
                onPress={handleFollowToggle}
                disabled={loading} // Disable while action is in progress
              >
                <View className="flex-row items-center">
                  <Ionicons name={isFollowing ? "checkmark-outline" : "person-add-outline"} size={18} color={isFollowing ? "black" : "white"} />
                  <Text className={`font-bold ml-2 ${isFollowing ? 'text-black' : 'text-white'}`}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
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
              Member since {memberSince}
            </Text>
          </View>

          {/* Bio */}
          {profile.bio && (
            <View className="mt-4 bg-transparent p-4 border-l-2 border-l-gray-400">
              <Text className="text-gray-700 leading-6">{profile.bio}</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <StatCard number={posts.length.toString()} label="Posts" />
            <StatCard number={followerCount.toString()} label="Followers" />
            <StatCard number={followingCount.toString()} label="Following" />
          </View>
        </View>

        {/* User's Posts */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold text-black mb-4 tracking-tight">
            Posts by {displayName}
          </Text>

          {posts.length === 0 && !loading && (
            <Text className="text-black/40 text-center mt-6 text-base">
              This user has not published anything yet.
            </Text>
          )}

          {posts.map((p, index) => (
            <TouchableOpacity
              key={p.id}
              activeOpacity={0.7}
              // onPress={() => { /* Optionally navigate to post detail */ }}
              className="mb-8 relative"
            >
              {/* Image Container */}
              {p.post_images?.length > 0 && (
                <View className="w-full aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden mb-4 border border-gray-200">
                  <Image
                    source={{ uri: p.post_images[0].image_url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Content Container */}
              <View className="px-1">
                {/* Title */}
                <Text
                  className="text-2xl font-bold text-black mb-3 leading-tight tracking-tight"
                  numberOfLines={2}
                >
                  {p.title}
                </Text>

                {/* Description */}
                {p.description && (
                  <Text
                    className="text-base text-black/60 mb-4 leading-6"
                    numberOfLines={2}
                  >
                    {p.description}
                  </Text>
                )}

                {/* Categories + Tags */}
                {(p.categories?.length > 0 || p.tags?.length > 0) && (
                  <View className="flex-row flex-wrap mb-4">
                    {p.categories?.map(c => (
                      <View
                        key={c.id}
                        className="bg-black px-3 py-1.5 rounded-full mr-2 mb-2"
                      >
                        <Text className="text-white text-xs font-semibold tracking-wide uppercase">
                          {c.name}
                        </Text>
                      </View>
                    ))}
                    {p.tags?.slice(0, 3).map(t => (
                      <View
                        key={t.id}
                        className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-full mr-2 mb-2"
                      >
                        <Text className="text-black/70 text-xs font-medium">
                          {t.name}
                        </Text>
                      </View>
                    ))}
                    {p.tags && p.tags.length > 3 && (
                      <View className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-full mr-2 mb-2">
                        <Text className="text-black/70 text-xs font-medium">
                          +{p.tags.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Divider */}
                {index !== posts.length - 1 && (
                  <View className="w-full h-px bg-gray-100 mt-4" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Details Section */}
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

      </ScrollView>
    </SafeAreaView>
  );
}