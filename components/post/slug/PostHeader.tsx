import React from 'react';
import { View, Text, Image } from 'react-native';
import { Post } from '@/context/PostsContext';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <>
      {post.post_images && post.post_images.length > 0 && (
        <View className="w-full aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden mb-6 border border-gray-200">
          <Image
            source={{ uri: post.post_images[0].image_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      )}
      <View className="px-6">
        <Text className="text-4xl font-bold text-black mb-4 leading-tight tracking-tight">
          {post.title}
        </Text>
      </View>
    </>
  );
}
