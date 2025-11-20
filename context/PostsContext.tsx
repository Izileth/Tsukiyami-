import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';

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

type PostsContextType = {
  posts: Post[];
  loading: boolean;
  fetchPosts: () => Promise<void>;
  createPost: (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'post_images' | 'categories' | 'tags'>, image_urls: string[], category_ids: number[], tag_ids: number[]) => Promise<{ data: any; error: PostgrestError | null }>;
  updatePost: (id: number, post: Partial<Post>, image_urls: string[], category_ids: number[], tag_ids: number[]) => Promise<{ data: any; error: PostgrestError | null }>;
  deletePost: (postId: number) => Promise<{ error: PostgrestError | null }>;
  getPostBySlug: (slug: string) => Post | undefined;
  incrementPostView: (postId: number) => void;
  updatePostLikes: (postId: number, newLikesCount: number) => void;
  updatePostDislikes: (postId: number, newDislikesCount: number) => void;
  updatePostCommentsCount: (postId: number, newCommentsCount: number) => void;
};

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

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_images (id, image_url),
          post_categories (
            categories (id, name)
          ),
          post_tags (
            tags (id, name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      if (data) {
        const formattedPosts: Post[] = data.map((post: any) => ({
          ...post,
          post_images: post.post_images || [],
          categories: post.post_categories?.map((pc: any) => pc.categories) || [],
          tags: post.post_tags?.map((pt: any) => pt.tags) || [],
        }));

        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Unexpected error in fetchPosts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const getPostBySlug = useCallback(
    (slug: string) => {
      return posts.find((post) => post.slug === slug);
    },
    [posts]
  );

  const incrementPostView = useCallback((postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, views_count: post.views_count + 1 } : post
      )
    );
  }, []);

  const updatePostLikes = useCallback(
    (postId: number, newLikesCount: number) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes_count: newLikesCount } : post
        )
      );
    },
    []
  );

  const updatePostDislikes = useCallback(
    (postId: number, newDislikesCount: number) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, dislikes_count: newDislikesCount } : post
        )
      );
    },
    []
  );

  const updatePostCommentsCount = useCallback(
    (postId: number, newCommentsCount: number) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments_count: newCommentsCount }
            : post
        )
      );
    },
    []
  );

  const createPost = useCallback(async (
    postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'post_images' | 'categories' | 'tags'>,
    image_urls: string[],
    category_ids: number[],
    tag_ids: number[]
  ) => {
    const { data, error } = await supabase.from('posts').insert(postData).select();
    if (error) return { data: null, error };
    if (!data) return { data: null, error: { message: "No data returned after post creation", code: "PGRST100", details: "No data", hint: "No hint" } as PostgrestError };

    const newPostData = data[0];
    const newPostId = newPostData.id;

    let postImages: PostImage[] = [];
    if (image_urls.length > 0) {
      const imagesToInsert = image_urls.map(url => ({ post_id: newPostId, image_url: url }));
      const { data: imgData, error: imgError } = await supabase.from('post_images').insert(imagesToInsert).select();
      if (imgError) console.error("Error inserting post images:", imgError);
      if (imgData) postImages = imgData;
    }

    let categories: Category[] = [];
    if (category_ids.length > 0) {
      const categoriesToInsert = category_ids.map(id => ({ post_id: newPostId, category_id: id }));
      const { data: catData, error: catError } = await supabase.from('post_categories').insert(categoriesToInsert).select(`categories ( id, name )`);
      if (catError) console.error("Error inserting post categories:", catError);
      if (catData) categories = catData.map((pc: any) => pc.categories);
    }

    let tags: Tag[] = [];
    if (tag_ids.length > 0) {
      const tagsToInsert = tag_ids.map(id => ({ post_id: newPostId, tag_id: id }));
      const { data: tagData, error: tagError } = await supabase.from('post_tags').insert(tagsToInsert).select(`tags ( id, name )`);
      if (tagError) console.error("Error inserting post tags:", tagError);
      if (tagData) tags = tagData.map((pt: any) => pt.tags);
    }

    const fullNewPost: Post = {
      ...newPostData,
      post_images: postImages,
      categories,
      tags,
      likes_count: 0,
      dislikes_count: 0,
      views_count: 0,
      comments_count: 0,
    };
    setPosts((prevPosts) => [fullNewPost, ...prevPosts]);
    return { data, error: null };
  }, []);

  const updatePost = useCallback(async (
    id: number,
    postData: Partial<Post>,
    image_urls: string[],
    category_ids: number[],
    tag_ids: number[]
  ) => {
    const { data, error } = await supabase.from('posts').update(postData).eq('id', id).select();
    if (error) return { data: null, error };
    if (!data) return { data: null, error: { message: "No data returned after post update", code: "PGRST100", details: "No data", hint: "No hint" } as PostgrestError };

    const updatedPostData = data[0];

    // Handle images
    await supabase.from('post_images').delete().eq('post_id', id);
    let postImages: PostImage[] = [];
    if (image_urls.length > 0) {
      const imagesToInsert = image_urls.map(url => ({ post_id: id, image_url: url }));
      const { data: imgData, error: imgError } = await supabase.from('post_images').insert(imagesToInsert).select();
      if (imgError) console.error("Error updating post images:", imgError);
      if (imgData) postImages = imgData;
    }

    // Handle categories
    await supabase.from('post_categories').delete().eq('post_id', id);
    let categories: Category[] = [];
    if (category_ids.length > 0) {
      const categoriesToInsert = category_ids.map(catId => ({ post_id: id, category_id: catId }));
      const { data: catData, error: catError } = await supabase.from('post_categories').insert(categoriesToInsert).select(`categories ( id, name )`);
      if (catError) console.error("Error updating post categories:", catError);
      if (catData) categories = catData.map((pc: any) => pc.categories);
    }

    // Handle tags
    await supabase.from('post_tags').delete().eq('post_id', id);
    let tags: Tag[] = [];
    if (tag_ids.length > 0) {
      const tagsToInsert = tag_ids.map(tagId => ({ post_id: id, tag_id: tagId }));
      const { data: tagData, error: tagError } = await supabase.from('post_tags').insert(tagsToInsert).select(`tags ( id, name )`);
      if (tagError) console.error("Error updating post tags:", tagError);
      if (tagData) tags = tagData.map((pt: any) => pt.tags);
    }

    const fullUpdatedPost: Post = {
      ...updatedPostData,
      post_images: postImages,
      categories,
      tags,
      likes_count: postData.likes_count ?? posts.find(p => p.id === id)?.likes_count ?? 0,
      dislikes_count: postData.dislikes_count ?? posts.find(p => p.id === id)?.dislikes_count ?? 0,
      views_count: postData.views_count ?? posts.find(p => p.id === id)?.views_count ?? 0,
      comments_count: postData.comments_count ?? posts.find(p => p.id === id)?.comments_count ?? 0,
    };
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === id ? fullUpdatedPost : post))
    );
    return { data, error: null };
  }, [posts]);
  
  const deletePost = useCallback(async (id: number) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
    }
    return { error };
  }, []);

  const value = {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    getPostBySlug,
    incrementPostView,
    updatePostLikes,
    updatePostDislikes,
    updatePostCommentsCount,
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
};