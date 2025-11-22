import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '@/context/PostsContext';
import { useReactions } from '@/context/LikesContext';

interface PostMetaProps {
  post: Post;
  onLike: () => void;
  onDislike: () => void;
}

export function PostMeta({
  post,
  onLike,
  onDislike,
}: PostMetaProps) {
  const { userLikes, userDislikes, loadingPostId } = useReactions();

  const hasLiked = userLikes.has(post.id);
  const hasDisliked = userDislikes.has(post.id);
  const reactionLoading = loadingPostId === post.id;

  return (
    <View className="px-6">
      {(post.categories.length > 0 || post.tags.length > 0) && (
        <View className="flex-row flex-wrap mb-6">
          {post.categories.map(c => (
            <View
              key={c.id}
              className="bg-black px-4 py-2 rounded-full mr-2 mb-2"
            >
              <Text className="text-white text-xs font-semibold uppercase tracking-wide">
                {c.name}
              </Text>
            </View>
          ))}

          {post.tags.slice(0, 4).map(t => (
            <View
              key={t.id}
              className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-full mr-2 mb-2"
            >
              <Text className="text-black/70 text-xs font-medium tracking-wide">
                {t.name}
              </Text>
            </View>
          ))}

          {post.tags.length > 4 && (
            <View className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-full mr-2 mb-2">
              <Text className="text-black/70 text-xs font-medium">
                ( +{post.tags.length - 4} )
              </Text>
            </View>
          )}
        </View>
      )}

      <View className="flex-row items-center py-4 mb-8 border-t border-b border-gray-100">
        <View className="flex-row items-center mr-8">
          <Ionicons name="eye-outline" size={20} color="#666" />
          <Text className="text-black/60 text-sm ml-2 font-medium">
            {post.views_count.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onLike}
          className="flex-row items-center mr-8"
          activeOpacity={0.7}
          disabled={reactionLoading}
        >
          {reactionLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons
              name={hasLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={hasLiked ? '#000' : '#666'}
            />
          )}
          <Text
            className={`text-sm ml-2 font-medium ${
              hasLiked ? 'text-black' : 'text-black/60'
            }`}
          >
            {post.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDislike}
          className="flex-row items-center"
          activeOpacity={0.7}
          disabled={reactionLoading}
        >
          {reactionLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons
              name={hasDisliked ? 'heart-dislike' : 'heart-dislike-outline'}
              size={20}
              color={hasDisliked ? '#000' : '#666'}
            />
          )}
          <Text
            className={`text-sm ml-2 font-medium ${
              hasDisliked ? 'text-black' : 'text-black/60'
            }`}
          >
            {post.dislikes_count}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
