import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Post } from '@/context/PostsContext';

interface PostsSectionProps {
  posts: Post[];
  userId?: string;
  isLoading: boolean;
  onDeletePost: (postId: number) => void;
}

export function PostsSection({
  posts,
  userId,
  isLoading,
  onDeletePost,
}: PostsSectionProps) {
  const userPosts = posts.filter((p) => p.user_id === userId);

  if (isLoading) {
    return <ActivityIndicator className="mt-6" />;
  }

  return (
    <View className="mb-6 px-6">
      <Text className="mb-4 text-2xl font-bold tracking-tight text-black">Minhas Postagens</Text>

      {userPosts.length === 0 && (
        <Text className="mt-6 text-center text-base text-black/40">
          Você ainda não publicou nada.
        </Text>
      )}

      {userPosts.map((p, index) => (
        <View key={p.id} className="relative mb-8">
          <Link href={{ pathname: '/(post)/form', params: { postId: p.id } }} asChild>
            <TouchableOpacity activeOpacity={0.7}>
              {p.post_images?.[0]?.image_url && (
                <View className="aspect-[4/3] w-full mb-4 overflow-hidden rounded-3xl border border-gray-200 bg-gray-100">
                  <Image
                    source={{ uri: p.post_images[0].image_url }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Edit Icon */}
              <View className="absolute top-4 right-20 bg-white/90 p-3 rounded-full border border-gray-200">
                <Ionicons name="create-outline" size={18} color="#333" />
              </View>

              {/* Content */}
              <View className="px-1">
                <Text className="mb-3 text-2xl font-bold leading-tight tracking-tight text-black" numberOfLines={2}>
                  {p.title}
                </Text>
                {p.description && (
                  <Text className="mb-4 text-base leading-6 text-black/60" numberOfLines={2}>
                    {p.description}
                  </Text>
                )}
                {/* Categories & Tags */}
                <View className="flex-row flex-wrap">
                  {p.categories.map((c) => (
                    <View key={c.id} className="mb-2 mr-2 rounded-full bg-black px-3 py-1.5">
                      <Text className="text-xs font-semibold uppercase tracking-wide text-white">{c.name}</Text>
                    </View>
                  ))}
                  {p.tags.slice(0, 3).map((t) => (
                    <View key={t.id} className="mb-2 mr-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1.5">
                      <Text className="text-xs font-medium text-black/70">{t.name}</Text>
                    </View>
                  ))}
                  {p.tags.length > 3 && (
                    <View className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1.5">
                      <Text className="text-xs font-medium text-black/70">+{p.tags.length - 3}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Link>
          
          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => onDeletePost(p.id)}
            className="absolute top-4 right-4 bg-white/90 p-3 rounded-full border border-gray-200"
          >
            <Ionicons name="trash-outline" size={18} color="#c00" />
          </TouchableOpacity>
          
          {index !== userPosts.length - 1 && <View className="mt-8 h-px w-full bg-gray-100" />}
        </View>
      ))}
    </View>
  );
}
