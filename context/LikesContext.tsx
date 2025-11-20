import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// --- Interfaces ---
export interface Like {
  user_id: string;
  post_id: number;
  created_at: string;
}

export interface Dislike {
  user_id: string;
  post_id: number;
  created_at: string;
}

interface ReactionsContextType {
  // Likes
  userHasLiked: (postId: number) => boolean;
  toggleLike: (postId: number) => Promise<void>;
  getLikesCount: (postId: number) => number;
  
  // Dislikes
  userHasDisliked: (postId: number) => boolean;
  toggleDislike: (postId: number) => Promise<void>;
  getDislikesCount: (postId: number) => number;
  
  // Loading states
  loading: boolean;
  likesLoading: boolean;
  dislikesLoading: boolean;
}

const ReactionsContext = createContext<ReactionsContextType | undefined>(undefined);

export const useReactions = () => {
  const context = useContext(ReactionsContext);
  if (!context) {
    throw new Error('useReactions must be used within a ReactionsProvider');
  }
  return context;
};

export const ReactionsProvider = ({ children }: { children: React.ReactNode }) => {
  // Likes state
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [likesCount, setLikesCount] = useState<Map<number, number>>(new Map());
  const [likesLoading, setLikesLoading] = useState(false);

  // Dislikes state
  const [userDislikes, setUserDislikes] = useState<Set<number>>(new Set());
  const [dislikesCount, setDislikesCount] = useState<Map<number, number>>(new Map());
  const [dislikesLoading, setDislikesLoading] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Likes functions
  const userHasLiked = (postId: number) => userLikes.has(postId);
  const getLikesCount = (postId: number) => likesCount.get(postId) || 0;

  const toggleLike = async (postId: number) => {
    if (!userId) {
      console.warn('User not authenticated. Cannot toggle like.');
      return;
    }
    setLikesLoading(true);

    try {
      const currentlyLiked = userLikes.has(postId);
      const currentlyDisliked = userDislikes.has(postId);

      if (currentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (error) throw error;

        setUserLikes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setLikesCount((prev) => {
          const newMap = new Map(prev);
          newMap.set(postId, (newMap.get(postId) || 1) - 1);
          return newMap;
        });
      } else {
        // Add like - remove dislike if exists
        if (currentlyDisliked) {
          await supabase
            .from('dislikes')
            .delete()
            .eq('user_id', userId)
            .eq('post_id', postId);

          setUserDislikes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
          setDislikesCount((prev) => {
            const newMap = new Map(prev);
            newMap.set(postId, (newMap.get(postId) || 1) - 1);
            return newMap;
          });
        }

        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: userId, post_id: postId });

        if (error) throw error;

        setUserLikes((prev) => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
        setLikesCount((prev) => {
          const newMap = new Map(prev);
          newMap.set(postId, (newMap.get(postId) || 0) + 1);
          return newMap;
        });
      }
    } catch (error: any) {
      console.error('Error toggling like:', error.message);
    } finally {
      setLikesLoading(false);
    }
  };

  // Dislikes functions
  const userHasDisliked = (postId: number) => userDislikes.has(postId);
  const getDislikesCount = (postId: number) => dislikesCount.get(postId) || 0;

  const toggleDislike = async (postId: number) => {
    if (!userId) {
      console.warn('User not authenticated. Cannot toggle dislike.');
      return;
    }
    setDislikesLoading(true);

    try {
      const currentlyDisliked = userDislikes.has(postId);
      const currentlyLiked = userLikes.has(postId);

      if (currentlyDisliked) {
        // Remove dislike
        const { error } = await supabase
          .from('dislikes')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (error) throw error;

        setUserDislikes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setDislikesCount((prev) => {
          const newMap = new Map(prev);
          newMap.set(postId, (newMap.get(postId) || 1) - 1);
          return newMap;
        });
      } else {
        // Add dislike - remove like if exists
        if (currentlyLiked) {
          await supabase
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('post_id', postId);

          setUserLikes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
          setLikesCount((prev) => {
            const newMap = new Map(prev);
            newMap.set(postId, (newMap.get(postId) || 1) - 1);
            return newMap;
          });
        }

        // Add dislike
        const { error } = await supabase
          .from('dislikes')
          .insert({ user_id: userId, post_id: postId });

        if (error) throw error;

        setUserDislikes((prev) => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
        setDislikesCount((prev) => {
          const newMap = new Map(prev);
          newMap.set(postId, (newMap.get(postId) || 0) + 1);
          return newMap;
        });
      }
    } catch (error: any) {
      console.error('Error toggling dislike:', error.message);
    } finally {
      setDislikesLoading(false);
    }
  };

  const loading = likesLoading || dislikesLoading;

  return (
    <ReactionsContext.Provider value={{ 
      userHasLiked, 
      toggleLike, 
      getLikesCount,
      userHasDisliked,
      toggleDislike,
      getDislikesCount,
      loading,
      likesLoading,
      dislikesLoading
    }}>
      {children}
    </ReactionsContext.Provider>
  );
};