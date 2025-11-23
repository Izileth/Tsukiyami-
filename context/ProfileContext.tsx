import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from './AuthContext';

export type Profile = {
  id: string;
  name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  role?: 'ADM' | 'US';
  position?: string;
  social_media_links?: any;
  website?: string;
  location?: string;
  birth_date?: string | null; // ISO date string
  updated_at?: string; // ISO date-time string
  created_at?: string; // ISO date-time string
  slug?: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
};

type ProfileContextType = {
  profile: Profile | null;
  loading: boolean;
  followerCount: number;
  followingCount: number;
  updateProfile: (updatedProfile: Partial<Profile>) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        setLoading(true);
        try {
          // Fetch profile, followers, and following in parallel
          const [profileRes, followersRes, followingRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', session.user.id).single(),
            supabase.from('followers').select('*', { count: 'exact' }).eq('following_id', session.user.id),
            supabase.from('followers').select('*', { count: 'exact' }).eq('follower_id', session.user.id)
          ]);

          if (profileRes.error && profileRes.error.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileRes.error);
          } else {
            setProfile(profileRes.data);
          }

          setFollowerCount(followersRes.count ?? 0);
          setFollowingCount(followingRes.count ?? 0);

        } catch(error) {
            console.error('Failed to fetch profile data:', error)
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    const profileSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${session?.user?.id}` }, (payload) => {
        setProfile(payload.new as Profile);
      })
      .subscribe();
      
    // Note: This won't update counts in real-time without more specific subscriptions
    // which can be complex. A pull-to-refresh or re-fetch on focus would be a good addition.

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [session]);

  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    if (!session?.user) {
      throw new Error('No user session');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    setProfile(data);
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, followerCount, followingCount, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
