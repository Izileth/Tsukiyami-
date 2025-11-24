import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Post } from '@/types'; // Assuming Post type is exported from here

interface UserPostsProps {
  posts: Post[];
  displayName: string;
  loading: boolean;
}

export const UserPosts = ({ posts, displayName, loading }: UserPostsProps) => {
  return (
    <View className="px-6 mb-6">
      <Text className="text-2xl font-bold text-black mb-4 tracking-tight">
        Postado por {displayName}
      </Text>

      {posts.length === 0 && !loading && (
        <Text className="text-black/40 text-center mt-6 text-base">
          Esse Usuário não postou nada ainda.
        </Text>
      )}

      {posts.map((p, index) => (
        <TouchableOpacity
          key={p.id}
          activeOpacity={0.7}
          // onPress={() => { /* Optionally navigate to post detail */ }}
          className="mb-8 relative"
        >
          {/* Image Container */}
          {p.post_images?.length > 0 && (
            <View className="w-full aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden mb-4 border border-gray-200">
              <Image
                source={{ uri: p.post_images[0].image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Content Container */}
          <View className="px-1">
            {/* Title */}
            <Text
              className="text-2xl font-bold text-black mb-3 leading-tight tracking-tight"
              numberOfLines={2}
            >
              {p.title}
            </Text>

            {/* Description */}
            {p.description && (
              <Text
                className="text-base text-black/60 mb-4 leading-6"
                numberOfLines={2}
              >
                {p.description}
              </Text>
            )}

            {/* Categories + Tags */}
            {(p.categories?.length > 0 || p.tags?.length > 0) && (
              <View className="flex-row flex-wrap mb-4">
                {p.categories?.map(c => (
                  <View
                    key={c.id}
                    className="bg-black px-3 py-1.5 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-white text-xs font-semibold tracking-wide uppercase">
                      {c.name}
                    </Text>
                  </View>
                ))}
                {p.tags?.slice(0, 3).map(t => (
                  <View
                    key={t.id}
                    className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-black/70 text-xs font-medium">
                      {t.name}
                    </Text>
                  </View>
                ))}
                {p.tags && p.tags.length > 3 && (
                  <View className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-full mr-2 mb-2">
                    <Text className="text-black/70 text-xs font-medium">
                      +{p.tags.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Divider */}
            {index !== posts.length - 1 && (
              <View className="w-full h-px bg-gray-100 mt-4" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
