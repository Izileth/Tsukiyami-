import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';

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

  const fetchComments = async (postId: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles(id, avatar_url, name, slug)
      `)
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
    const { data: userData, error: userError } = await supabase.auth.getSession();
    if (userError || !userData?.session?.user) {
      setLoading(false);
      return { data: null, error: userError || { message: "User not authenticated", code: "401", details: "No active session", hint: "Login required" } as PostgrestError };
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userData.session.user.id,
        content,
        parent_comment_id: parentCommentId,
      })
      .select(`
        *,
        profiles(id, avatar_url, name, slug)
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      setLoading(false);
      return { data: null, error };
    }

    if (data) {
      setComments((prevComments) => [...prevComments, data]);
    }
    setLoading(false);
    return { data, error: null };
  };

  const updateComment = async (commentId: number, newContent: string) => {
    setLoading(true);
    const { data: userData, error: userError } = await supabase.auth.getSession();
    if (userError || !userData?.session?.user) {
      setLoading(false);
      return { data: null, error: userError || { message: "User not authenticated", code: "401", details: "No active session", hint: "Login required" } as PostgrestError };
    }

    const { data, error } = await supabase
      .from('comments')
      .update({ content: newContent, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('user_id', userData.session.user.id) // Ensure only author can update
      .select(`
        *,
        profiles(id, avatar_url, name, slug)
      `)
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      setLoading(false);
      return { data: null, error };
    }

    if (data) {
      setComments((prevComments) =>
        prevComments.map((comment) => (comment.id === data.id ? data : comment))
      );
    }
    setLoading(false);
    return { data, error: null };
  };

  const deleteComment = async (commentId: number) => {
    setLoading(true);
    const { data: userData, error: userError } = await supabase.auth.getSession();
    if (userError || !userData?.session?.user) {
      setLoading(false);
      return { error: userError || { message: "User not authenticated", code: "401", details: "No active session", hint: "Login required" } as PostgrestError };
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userData.session.user.id); // Ensure only author can delete

    if (error) {
      console.error('Error deleting comment:', error);
      setLoading(false);
      return { error };
    }

    setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    setLoading(false);
    return { error: null };
  };

  return (
    <CommentsContext.Provider value={{ comments, loading, fetchComments, addComment, updateComment, deleteComment }}>
      {children}
    </CommentsContext.Provider>
  );
};
