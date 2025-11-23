import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Alert } from 'react-native';
import { Post, UserProfile } from '@/types'; // Assuming you have a types file

export function usePublicProfile(slug: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
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
        } else {
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
            .from('followers')
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
          .from('followers')
          .select('*', { count: 'exact' })
          .eq('following_id', profileData.id);
        
        if (!followersError) {
          setFollowerCount(followers || 0);
        }

        // Fetch following count
        const { count: following, error: followingError } = await supabase
          .from('followers')
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
    setFollowLoading(true);

    try {
      const { data: userData } = await supabase.auth.getSession();
      const currentUserId = userData?.session?.user?.id;

      if (!currentUserId) {
        Alert.alert('Authentication Required', 'You must be logged in to follow users.');
        setFollowLoading(false);
        return;
      }

      if (currentUserId === profile.id) {
        Alert.alert('Action Not Allowed', 'You cannot follow yourself.');
        setFollowLoading(false);
        return;
      }

      if (isFollowing) {
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.id);

        if (error) {
          throw error;
        }
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
        Alert.alert('Success', `You unfollowed ${profile.name || profile.slug}`);
      } else {
        const { error } = await supabase
          .from('followers')
          .insert({ follower_id: currentUserId, following_id: profile.id });

        if (error) {
          throw error;
        }
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        Alert.alert('Success', `You are now following ${profile.name || profile.slug}`);
      }
    } catch (error: any) {
      console.error('Follow/Unfollow error:', error);
      Alert.alert('Error', `Failed to update follow status: ${error.message}`);
    } finally {
      setFollowLoading(false);
    }
  };

  return { profile, posts, loading, isFollowing, followerCount, followingCount, handleFollowToggle, followLoading };
}
