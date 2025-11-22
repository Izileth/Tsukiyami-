import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usePosts } from '@/context/PostsContext';
import { useProfile } from '@/context/ProfileContext';
import { useComments } from '@/context/CommentsContext';
import { useReactions } from '@/context/LikesContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostHeader } from '@/components/post/slug/PostHeader';
import { PostMeta } from '@/components/post/slug/PostMeta';
import { PostContent } from '@/components/post/slug/PostContent';
import { CommentsSection } from '@/components/post/slug/CommentsSection';

// Moved to PostScreen directly as it's simple
const LoadingIndicator = () => (
  <View className="flex-1 justify-center items-center bg-white">
    <ActivityIndicator size="large" color="#000000" />
  </View>
);

// Moved to PostScreen directly as it's simple
const PostNotFound = () => (
  <View className="flex-1 justify-center items-center bg-white p-4">
    <Text className="text-xl font-bold text-black mb-2">Post Not Found</Text>
    <Text className="text-gray-500 text-base text-center">
      The post you are looking for does not exist or has been removed.
    </Text>
  </View>
);

export default function PostScreen() {
  const { slug } = useLocalSearchParams();

  // Contextos
  const { profile } = useProfile();
  const { getPostBySlug, incrementView } = usePosts(); // incrementView now from usePosts
  const { comments, loading: commentsLoading, fetchComments, addComment } = useComments();
  const {
    userLikes,
    userDislikes,
    toggleLike,
    toggleDislike,
    loadingPostId,
  } = useReactions();

  // Estados locais
  const [initialLoading, setInitialLoading] = useState(true);

  // Buscar post do contexto
  const post = useMemo(() => {
    return getPostBySlug(slug as string);
  }, [slug, getPostBySlug]);

  // Fetch data
  const fetchPostData = useCallback(async () => {
    if (!slug || !post) {
      setInitialLoading(false);
      return;
    }

    try {
      await Promise.all([
        incrementView(post.id), // Use post.id and new incrementView
        fetchComments(post.id),
      ]);
    } catch (error) {
      console.error('Error fetching post data:', error);
    } finally {
      setInitialLoading(false);
    }
  }, [slug, post, fetchComments, incrementView]); // Add incrementView to deps

  useEffect(() => {
    if (slug) {
      fetchPostData();
    }
  }, [slug, fetchPostData]);

  // Handlers
  const handleAddComment = useCallback(async (commentText: string) => {
    if (!profile || !post) return;
    await addComment(post.id, commentText);
  }, [profile, post, addComment]);

  const handleLike = useCallback(async () => {
    if (!profile || !post) return;
    await toggleLike(post.id);
  }, [profile, post, toggleLike]);

  const handleDislike = useCallback(async () => {
    if (!profile || !post) return;
    await toggleDislike(post.id);
  }, [profile, post, toggleDislike]);

  // Dados calculados
  // Likes/Dislikes counts come directly from post object
  const currentLikesCount = post?.likes_count || 0;
  const currentDislikesCount = post?.dislikes_count || 0;

  // Use userLikes/userDislikes Sets from useReactions
  const hasLiked = post ? userLikes.has(post.id) : false;
  const hasDisliked = post ? userDislikes.has(post.id) : false;

  // Loading state for reactions
  const reactionLoading = loadingPostId === post?.id;

  // Combined loading state
  const isLoading = initialLoading || commentsLoading;

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!post) {
    return <PostNotFound />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <PostHeader post={post} />
        <PostMeta
          post={post}
          likesCount={currentLikesCount}
          dislikesCount={currentDislikesCount}
          hasLiked={hasLiked}
          hasDisliked={hasDisliked}
          onLike={handleLike}
          onDislike={handleDislike}
          likesLoading={reactionLoading} // Use reactionLoading
          dislikesLoading={reactionLoading} // Use reactionLoading
        />
        <PostContent post={post} />
        <CommentsSection
          comments={comments}
          profile={profile}
          commentsLoading={commentsLoading}
          onAddComment={handleAddComment}
        />
      </ScrollView>
    </SafeAreaView>
  );
}