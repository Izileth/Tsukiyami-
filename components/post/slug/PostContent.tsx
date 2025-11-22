import React from 'react';
import { View, Text } from 'react-native';
import { Post } from '@/context/PostsContext';

interface PostContentProps {
  post: Post;
}

export function PostContent({ post }: PostContentProps) {
  return (
    <View className="px-6">
      <Text className="text-base text-black/80 leading-7 mb-12">
        {post.content}
      </Text>
      <View className="w-full h-px bg-gray-100 mb-10" />
    </View>
  );
}
