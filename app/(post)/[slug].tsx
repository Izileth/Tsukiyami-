import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { ScrollView, View, ActivityIndicator, Text, KeyboardAvoidingView, Platform } from 'react-native';
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

const LoadingIndicator = () => (
  <View className="flex-1 justify-center items-center bg-white">
    <ActivityIndicator size="large" color="#000000" />
  </View>
);

const PostNotFound = () => (
  <View className="flex-1 justify-center items-center bg-white p-4">
    <Text className="text-xl font-bold text-black mb-2">Post Not Found</Text>
    <Text className="text-gray-500 text-base text-center">
      The post you are looking for does not exist or has been removed.
    </Text>
  </View>
);

export default function PostScreen() {
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : undefined;

  // Contextos
  const { profile } = useProfile();
  const { getPostBySlug, incrementView } = usePosts();
  const { comments, loading: commentsLoading, fetchComments, addComment, updateComment, deleteComment } = useComments();
  const {
    userLikes,
    userDislikes,
    toggleLike,
    toggleDislike,
    loadingPostId,
  } = useReactions();

  // Estados locais
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Refs
  const hasFetchedRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Buscar post do contexto - simplificado
  const post = useMemo(() => {
    if (!slug) return null;
    return getPostBySlug(slug);
  }, [slug, getPostBySlug]);

  // Fetch data - otimizado para rodar apenas UMA vez
  useEffect(() => {
    // Se não tem slug ou post, para aqui
    if (!slug || !post) {
      setInitialLoading(false);
      return;
    }

    // Se já buscou, não busca de novo
    if (hasFetchedRef.current) {
      return;
    }

    const fetchPostData = async () => {
      try {
        hasFetchedRef.current = true;
        
        await Promise.all([
          incrementView(post.id),
          fetchComments(post.id),
        ]);
      } catch (error) {
        console.error('Error fetching post data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPostData();
  }, [slug, post, incrementView, fetchComments]); // Added fetchComments, incrementView, and post

  // Reset do ref quando o slug muda
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [slug]);

  // Handlers - memoizados corretamente
  const handleAddComment = useCallback(async (commentText: string) => {
    if (!profile || !post) return;
    const result = await addComment(post.id, commentText);
    if (result && !result.error) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300); // Delay to allow UI to update
    }
  }, [profile, post, addComment]); // Added post, profile

  const handleLike = useCallback(async () => {
    if (!profile || !post) return;
    await toggleLike(post.id);
  }, [profile, post, toggleLike]); // Added post, profile

  const handleDislike = useCallback(async () => {
    if (!profile || !post) return;
    await toggleDislike(post.id);
  }, [profile, post, toggleDislike]); // Added post, profile

  // Dados calculados - memoizados
  const currentLikesCount = useMemo(() => post?.likes_count || 0, [post?.likes_count]);
  const currentDislikesCount = useMemo(() => post?.dislikes_count || 0, [post?.dislikes_count]);
  const hasLiked = useMemo(() => post ? userLikes.has(post.id) : false, [post, userLikes]); // Added post
  const hasDisliked = useMemo(() => post ? userDislikes.has(post.id) : false, [post, userDislikes]); // Added post
  const reactionLoading = useMemo(() => loadingPostId === post?.id, [loadingPostId, post?.id]);

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={100} // Adjust this value based on your header's height
      >
        <ScrollView
          ref={scrollViewRef}
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
            likesLoading={reactionLoading}
            dislikesLoading={reactionLoading}
          />
          <PostContent post={post} />
          <CommentsSection
            comments={comments}
            profile={profile}
            commentsLoading={commentsLoading}
            onAddComment={handleAddComment}
            onUpdateComment={updateComment}
            onDeleteComment={deleteComment}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}