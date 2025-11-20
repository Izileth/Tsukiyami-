import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { Post } from '@/context/PostsContext';

export default function PostScreen() {
  const { slug } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (data) {
        setPost(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!post) {
    return <Text>Post not found</Text>;
  }

  return (
    <View className="p-4">
      <Text className="text-2xl font-bold">{post.title}</Text>
      <Text className="mt-4">{post.content}</Text>
    </View>
  );
}
