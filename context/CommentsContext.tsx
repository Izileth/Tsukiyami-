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
      .select(`*, profiles(id, avatar_url, name, slug)`)
      .single();

    setLoading(false);
    if (error) {
      console.error('Error adding comment:', error);
      return { data: null, error };
    }

    if (data) {
      setComments((prev) => [...prev, data]);
      // Update count in PostsContext
      const post = posts.find(p => p.id === postId);
      if (post) {
        updatePostCommentsCount(postId, post.comments_count + 1);
      }
    }
    return { data, error: null };
  };


  const updateComment = async (commentId: number, newContent: string) => {
    // ... (no changes needed here)
    const { data, error } = await supabase.from('comments')
      .update({ content: newContent })
      .eq('id', commentId)
      .select();

    if (error) {
      console.error('Error updating comment:', error);
      return { data: null, error };
    }

    // Update count in PostsContext
    const post = posts.find(p => p.id === data?.post_id);
    if (post) {
      updatePostCommentsCount(data?.post_id, post.comments_count - 1);
    }

    return { data, error: null };
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
