import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { usePosts } from './PostsContext';

// --- Interfaces ---
export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    avatar_url: string | null;
    name: string | null;
    slug: string | null;
  } | null;
}

interface CommentsContextType {
  comments: Comment[];
  loading: boolean;
  fetchComments: (postId: number) => Promise<void>;
  addComment: (postId: number, content: string, parentCommentId?: number | null) => Promise<{ data: Comment | null, error: PostgrestError | null }>;
  updateComment: (commentId: number, newContent: string) => Promise<{ data: Comment | null, error: PostgrestError | null }>;
  deleteComment: (commentId: number) => Promise<{ error: PostgrestError | null }>;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
};

export const CommentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { posts, updatePostCommentsCount } = usePosts();

  const fetchComments = async (postId: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select(`*, profiles(id, avatar_url, name, slug)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  const addComment = async (postId: number, content: string, parentCommentId: number | null = null) => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return { data: null, error: { message: "User not authenticated", code: "401", details: "No active session", hint: "Login required" } as PostgrestError };
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: session.user.id, content, parent_comment_id: parentCommentId })
      .select(`*, profiles(id, avatar_url, name, slug)`);

    setLoading(false);
    if (error) {
      console.error('Error adding comment:', error);
      return { data: null, error };
    }

    if (data && data.length > 0) {
      const newComment = data[0];
      setComments((prev) => [...prev, newComment]);
      // Update count in PostsContext
      const post = posts.find(p => p.id === postId);
      if (post) {
        updatePostCommentsCount(postId, post.comments_count + 1);
      }
      return { data: newComment, error: null };
    }
    return { data: null, error: { message: "Failed to retrieve new comment.", code: "404", details: "", hint: ""} as PostgrestError };
  };


  const updateComment = async (commentId: number, newContent: string) => {
    setLoading(true);
    console.log(`[updateComment] Attempting to update comment ${commentId}`);

    // Step 1: Perform the update.
    const { error: updateError } = await supabase
      .from('comments')
      .update({ content: newContent, updated_at: new Date().toISOString() })
      .eq('id', commentId);

    if (updateError) {
      console.error('[updateComment] Error during UPDATE step:', updateError);
      setLoading(false);
      return { data: null, error: updateError };
    }

    console.log('[updateComment] UPDATE step successful. Fetching updated comment...');

    // Step 2: Fetch the updated data.
    const { data: selectData, error: selectError } = await supabase
      .from('comments')
      .select(`*, profiles(id, avatar_url, name, slug)`)
      .eq('id', commentId)
      .single();

    setLoading(false);
    if (selectError) {
      console.error('[updateComment] Error during SELECT step:', selectError);
      return { data: null, error: selectError };
    }
    
    console.log('[updateComment] Received updated comment:', selectData);
    setComments((prev) => {
      console.log('[updateComment] Updating local state...');
      const newComments = prev.map(comment => comment.id === commentId ? selectData : comment);
      console.log('[updateComment] New local state:', newComments);
      return newComments;
    });
    return { data: selectData, error: null };
  };
  const deleteComment = async (commentId: number) => {
    setLoading(true);
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete) {
      setLoading(false);
      return { error: { message: "Comment not found", code: "404", details: "", hint: "" } as PostgrestError };
    }

    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    setLoading(false);
    if (error) {
      console.error('Error deleting comment:', error);
      return { error };
    }

    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    // Update count in PostsContext
    const post = posts.find(p => p.id === commentToDelete.post_id);
    if (post) {
      updatePostCommentsCount(commentToDelete.post_id, post.comments_count - 1);
    }
    return { error: null };
  };

  return (
    <CommentsContext.Provider value={{ comments, loading, fetchComments, addComment, updateComment, deleteComment }}>
      {children}
    </CommentsContext.Provider>
  );
};
