import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';

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
  created_at: string;
  updated_at: string;
}

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  createPost: (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>, image_urls: string[], category_ids: number[], tag_ids: number[]) => Promise<{ data: Post[] | null, error: PostgrestError | null }>;
  updatePost: (id: number, post: Partial<Post>, image_urls: string[], category_ids: number[], tag_ids: number[]) => Promise<{ data: Post[] | null, error: PostgrestError | null }>;
  deletePost: (id: number) => Promise<{ error: PostgrestError | null }>;
  fetchPosts: () => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};

export const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>, image_urls: string[], category_ids: number[], tag_ids: number[]) => {
    const { data, error } = await supabase.from('posts').insert(post).select();
    if (error) return { data: null, error };
    if (!data) return { data: null, error: new PostgrestError({ message: "No data returned after post creation", details: "", hint: "", code: "" }) };

    const newPost = data[0];

    if (image_urls.length > 0) {
      const imagesToInsert = image_urls.map(url => ({ post_id: newPost.id, image_url: url }));
      await supabase.from('post_images').insert(imagesToInsert);
    }
    if (category_ids.length > 0) {
      const categoriesToInsert = category_ids.map(id => ({ post_id: newPost.id, category_id: id }));
      await supabase.from('post_categories').insert(categoriesToInsert);
    }
    if (tag_ids.length > 0) {
      const tagsToInsert = tag_ids.map(id => ({ post_id: newPost.id, tag_id: id }));
      await supabase.from('post_tags').insert(tagsToInsert);
    }

    setPosts(prevPosts => [newPost, ...prevPosts]);
    return { data, error };
  };

  const updatePost = async (id: number, post: Partial<Post>, image_urls: string[], category_ids: number[], tag_ids: number[]) => {
    const { data, error } = await supabase.from('posts').update(post).eq('id', id).select();
    if (error) return { data: null, error };
    if (!data) return { data: null, error: new PostgrestError({ message: "No data returned after post update", details: "", hint: "", code: "" }) };

    const updatedPost = data[0];

    await supabase.from('post_images').delete().eq('post_id', id);
    if (image_urls.length > 0) {
      const imagesToInsert = image_urls.map(url => ({ post_id: id, image_url: url }));
      await supabase.from('post_images').insert(imagesToInsert);
    }

    await supabase.from('post_categories').delete().eq('post_id', id);
    if (category_ids.length > 0) {
      const categoriesToInsert = category_ids.map(catId => ({ post_id: id, category_id: catId }));
      await supabase.from('post_categories').insert(categoriesToInsert);
    }

    await supabase.from('post_tags').delete().eq('post_id', id);
    if (tag_ids.length > 0) {
      const tagsToInsert = tag_ids.map(tagId => ({ post_id: id, tag_id: tagId }));
      await supabase.from('post_tags').insert(tagsToInsert);
    }

    setPosts(prevPosts => prevPosts.map(p => (p.id === id ? updatedPost : p)));
    return { data, error };
  };

  const deletePost = async (id: number) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
    }
    return { error };
  };

  return (
    <PostsContext.Provider value={{ posts, loading, createPost, updatePost, deletePost, fetchPosts }}>
      {children}
    </PostsContext.Provider>
  );
};
