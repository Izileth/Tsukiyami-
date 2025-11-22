import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { usePosts } from './PostsContext';

interface ReactionsContextType {
  userLikes: Set<number>;
  userDislikes: Set<number>;
  isLiking: (postId: number) => boolean;
  isDisliking: (postId: number) => boolean;
  toggleLike: (postId: number) => Promise<void>;
  toggleDislike: (postId: number) => Promise<void>;
  loadingPostId: number | null;
}

const ReactionsContext = createContext<ReactionsContextType | undefined>(undefined);

export const useReactions = () => {
  const context = useContext(ReactionsContext);
  if (!context) throw new Error('useReactions must be used within a ReactionsProvider');
  return context;
};

export const ReactionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { posts, updatePostLikes, updatePostDislikes } = usePosts();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [userDislikes, setUserDislikes] = useState<Set<number>>(new Set());
  const [loadingPostId, setLoadingPostId] = useState<number | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user) {
        const { data: likes, error: likesError } = await supabase.from('likes').select('post_id').eq('user_id', user.id);
        if (likes) setUserLikes(new Set(likes.map(l => l.post_id)));
        
        const { data: dislikes, error: dislikesError } = await supabase.from('dislikes').select('post_id').eq('user_id', user.id);
        if (dislikes) setUserDislikes(new Set(dislikes.map(d => d.post_id)));
      }
    };
    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);
      if (!newUserId) {
          setUserLikes(new Set());
          setUserDislikes(new Set());
      } else {
          initialize(); // Re-initialize on user change
      }
    });

    return () => authListener?.subscription.unsubscribe();
  }, []);

  const isLiking = (postId: number) => loadingPostId === postId;
  const isDisliking = (postId: number) => loadingPostId === postId;

  const toggleLike = useCallback(async (postId: number) => {
    if (!userId) return;

    setLoadingPostId(postId);
    const post = posts.find(p => p.id === postId);
    if (!post) {
        setLoadingPostId(null);
        return;
    }
    
    const isLiked = userLikes.has(postId);
    const isDisliked = userDislikes.has(postId);
    let optimisticLikes = post.likes_count;
    let optimisticDislikes = post.dislikes_count;

    if (isLiked) {
      // Unlike
      optimisticLikes--;
      setUserLikes(prev => { const next = new Set(prev); next.delete(postId); return next; });
      updatePostLikes(postId, optimisticLikes);
      await supabase.from('likes').delete().match({ user_id: userId, post_id: postId });
    } else {
      // Like
      optimisticLikes++;
      setUserLikes(prev => new Set(prev).add(postId));
      updatePostLikes(postId, optimisticLikes);

      if (isDisliked) {
        optimisticDislikes--;
        setUserDislikes(prev => { const next = new Set(prev); next.delete(postId); return next; });
        updatePostDislikes(postId, optimisticDislikes);
        // Await the two operations in parallel
        await Promise.all([
            supabase.from('likes').insert({ user_id: userId, post_id: postId }),
            supabase.from('dislikes').delete().match({ user_id: userId, post_id: postId })
        ]);
      } else {
        await supabase.from('likes').insert({ user_id: userId, post_id: postId });
      }
    }
    setLoadingPostId(null);
  }, [userId, userLikes, userDislikes, posts, updatePostLikes, updatePostDislikes]);


  const toggleDislike = useCallback(async (postId: number) => {
    if (!userId) return;

    setLoadingPostId(postId);
    const post = posts.find(p => p.id === postId);
    if (!post) {
        setLoadingPostId(null);
        return;
    }

    const isDisliked = userDislikes.has(postId);
    const isLiked = userLikes.has(postId);
    let optimisticDislikes = post.dislikes_count;
    let optimisticLikes = post.likes_count;

    if (isDisliked) {
      // Undislike
      optimisticDislikes--;
      setUserDislikes(prev => { const next = new Set(prev); next.delete(postId); return next; });
      updatePostDislikes(postId, optimisticDislikes);
      await supabase.from('dislikes').delete().match({ user_id: userId, post_id: postId });
    } else {
      // Dislike
      optimisticDislikes++;
      setUserDislikes(prev => new Set(prev).add(postId));
      updatePostDislikes(postId, optimisticDislikes);

      if (isLiked) {
        optimisticLikes--;
        setUserLikes(prev => { const next = new Set(prev); next.delete(postId); return next; });
        updatePostLikes(postId, optimisticLikes);
        await Promise.all([
            supabase.from('dislikes').insert({ user_id: userId, post_id: postId }),
            supabase.from('likes').delete().match({ user_id: userId, post_id: postId })
        ]);
      } else {
        await supabase.from('dislikes').insert({ user_id: userId, post_id: postId });
      }
    }
    setLoadingPostId(null);
  }, [userId, userDislikes, userLikes, posts, updatePostDislikes, updatePostLikes]);

  return (
    <ReactionsContext.Provider value={{ 
      userLikes,
      userDislikes,
      isLiking: (postId) => userLikes.has(postId),
      isDisliking: (postId) => userDislikes.has(postId),
      toggleLike, 
      toggleDislike,
      loadingPostId,
    }}>
      {children}
    </ReactionsContext.Provider>
  );
};