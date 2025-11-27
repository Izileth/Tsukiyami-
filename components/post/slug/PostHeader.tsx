import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Post } from '@/context/PostsContext';


interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <>
      {post.post_images && post.post_images.length > 0 && (
        <View className="w-full px-4 rounded-xl aspect-[4/3] bg-gray-100 mb-6">
          <Image
            source={{ uri: post.post_images[0].image_url }}
            className="w-full h-full rounded-xl"
            resizeMode="cover"
          />
        </View>
      )}
      
      <View className="px-6">
        {/* Author Info */}
        {post.profile && (
          <Link href={{
            pathname: '/(profile)/[slug]',
            params: { slug: post?.profile?.slug || '' }
          }} asChild>
            <TouchableOpacity className="flex-row items-center mb-4">
              <Image
                source={{ uri: post.profile.avatar_url || 'https://via.placeholder.com/40' }} // Placeholder for no avatar
                className="w-10 h-10 rounded-full mr-3"
              />
              <View>
                <Text className="text-sm font-semibold text-black">
                  {post.profile.name || post.profile.first_name || 'Usuário Anônimo'}
                </Text>
                {post.profile.slug && (
                  <Text className="text-xs text-black/60">
                    @{post.profile.slug}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </Link>
        )}

        <Text className="text-4xl font-bold text-black mb-2 leading-tight tracking-tight">
          {post.title}
        </Text>
        <Text className="text-xl font-semibold text-black mb-6 leading-tight tracking-tight">
          {post.description}
        </Text>


      </View>
    </>
  );
}
