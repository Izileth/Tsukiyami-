import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePosts } from '@/context/PostsContext';
import { useProfile } from '@/context/ProfileContext';
import { useComments } from '@/context/CommentsContext';
import { useViews } from '@/context/ViewsContext';
import { useReactions } from '@/context/LikesContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostScreen() {
  const { slug } = useLocalSearchParams();
  const { profile } = useProfile();
  const router = useRouter();

  // Usar todos os contextos especializados
  const { getPostBySlug } = usePosts();
  const {
    comments,
    loading: commentsLoading,
    fetchComments,
    addComment
  } = useComments();
  const { incrementView } = useViews();

  const {
    userHasLiked,
    toggleLike,
    getLikesCount,
    userHasDisliked,
    toggleDislike,
    getDislikesCount,
    likesLoading,
    dislikesLoading
  } = useReactions();


  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [focusedComment, setFocusedComment] = useState(false);

  // Buscar post do contexto
  const post = getPostBySlug(slug as string);

 

  const fetchPostData = useCallback(async () => {
    if (!slug || !post) return;

    setLoading(true);

    try {
      // Incrementar visualização usando o contexto
      await incrementView(slug as string);

      // Buscar comentários usando o contexto
      await fetchComments(post.id);

      // O contexto de likes já gerencia o estado automaticamente
      // Não precisamos mais buscar manualmente o status de like
    } catch (error) {
      console.error('Error fetching post data:', error);
    } finally {
      setLoading(false);
    }
  }, [slug, post, incrementView, fetchComments]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  useEffect(() => {
    fetchPostData();
  }, [slug, post, fetchPostData]);

  const handleAddComment = async () => {
    if (!profile || !post || newComment.trim() === '') return;

    const { data, error } = await addComment(post.id, newComment.trim());

    if (data && !error) {
      setNewComment('');
    }
  };

  const handleLike = async () => {
    if (!profile || !post) return;
    await toggleLike(post.id);
  };



  const handleDislike = async () => {
    if (!profile || !post) return;
    await toggleDislike(post.id);
  };



  // Usar dados dos contextos
  const currentLikesCount = post ? getLikesCount(post.id) : 0;
  const currentDislikesCount = post ? getDislikesCount(post.id) : 0;
  const hasLiked = post ? userHasLiked(post.id) : false;
  const hasDisliked = post ? userHasDisliked(post.id) : false;


  if (loading || commentsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-black/50 text-sm mt-4">Carregando post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle-outline" size={64} color="#999999" />
          <Text className="text-lg text-black/60 mt-4 mb-2">Post não encontrado</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-black px-6 py-3 rounded-xl mt-4"
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Image */}
        {post.post_images && post.post_images.length > 0 && (
          <View className="w-full aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden mb-6 border border-gray-200">
            <Image
              source={{ uri: post.post_images[0].image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Content */}
        <View className="px-6">
          {/* Title */}
          <Text className="text-4xl font-bold text-black mb-4 leading-tight tracking-tight">
            {post.title}
          </Text>

          {/* Tags / Categories */}
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

          {/* Stats */}
          <View className="flex-row items-center py-4 mb-8 border-t border-b border-gray-100">
            {/* Views */}
            <View className="flex-row items-center mr-8">
              <Ionicons name="eye-outline" size={20} color="#666" />
              <Text className="text-black/60 text-sm ml-2 font-medium">
                {post.views_count.toLocaleString()}
              </Text>
            </View>

            {/* Like */}
            <TouchableOpacity
              onPress={handleLike}
              className="flex-row items-center mr-8"
              activeOpacity={0.7}
              disabled={likesLoading}
            >
              <Ionicons
                name={hasLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={hasLiked ? '#000' : '#666'}
              />
              <Text
                className={`text-sm ml-2 font-medium ${hasLiked ? 'text-black' : 'text-black/60'
                  }`}
              >
                {currentLikesCount}
              </Text>
            </TouchableOpacity>

            {/* Dislike */}
            <TouchableOpacity
              onPress={handleDislike}
              className="flex-row items-center"
              activeOpacity={0.7}
              disabled={dislikesLoading}
            >
              <Ionicons
                name={hasDisliked ? 'heart-dislike' : 'heart-dislike-outline'}
                size={20}
                color={hasDisliked ? '#000' : '#666'}
              />
              <Text
                className={`text-sm ml-2 font-medium ${hasDisliked ? 'text-black' : 'text-black/60'
                  }`}
              >
                {currentDislikesCount}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <Text className="text-base text-black/80 leading-7 mb-12">
            {post.content}
          </Text>

          <View className="w-full h-px bg-gray-100 mb-10" />

          {/* Comments */}
          <View>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <Ionicons name="chatbubbles-outline" size={26} color="#000" />
                <Text className="text-2xl font-bold text-black ml-3">
                  Comentários
                </Text>
              </View>
              <View className="bg-black px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-bold">
                  {comments.length}
                </Text>
              </View>
            </View>

            {/* Comments List */}
            {comments.length > 0 ? (
              <View className="mb-6">
                {comments.map(comment => (
                  <View
                    key={comment.id}
                    className="bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-100"
                  >
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 bg-black rounded-full justify-center items-center mr-3">
                        <Text className="text-white text-xs font-bold">
                          {comment.profiles?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                      </View>

                      <View className="flex-1">
                        <Text className="text-black font-bold text-sm">
                          {comment.profiles?.name || 'Usuário'}
                        </Text>

                        <Text className="text-black/40 text-xs mt-1">
                          {new Date(comment.created_at).toLocaleDateString(
                            'pt-BR',
                            {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-black/70 text-sm leading-6 ml-11">
                      {comment.content}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-gray-50 rounded-2xl p-10 items-center border border-gray-100 mb-6">
                <Ionicons name="chatbubble-outline" size={40} color="#999" />
                <Text className="text-black/50 text-sm mt-3 text-center">
                  Seja o primeiro a comentar
                </Text>
              </View>
            )}

            {/* Add Comment */}
            {profile ? (
              <View className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <Text className="text-xs text-black/70 mb-3 tracking-wider uppercase font-semibold">
                  Adicionar Comentário
                </Text>

                <View className="flex-row items-start">
                  <View className="flex-1 mr-3">
                    <TextInput
                      placeholder="Escreva seu comentário..."
                      placeholderTextColor="#999"
                      value={newComment}
                      onChangeText={setNewComment}
                      onFocus={() => setFocusedComment(true)}
                      onBlur={() => setFocusedComment(false)}
                      multiline
                      className={`bg-gray-50 border-2 rounded-xl px-4 py-3 text-base min-h-[100px] ${focusedComment ? 'border-black' : 'border-gray-200'
                        } text-black`}
                      textAlignVertical="top"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleAddComment}
                    disabled={!newComment.trim() || commentsLoading}
                    className={`w-12 h-12 rounded-xl justify-center items-center ${newComment.trim() && !commentsLoading ? 'bg-black' : 'bg-gray-300'
                      }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={newComment.trim() && !commentsLoading ? '#fff' : '#999'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="bg-gray-50 rounded-2xl p-6 items-center border border-gray-200">
                <Ionicons name="lock-closed-outline" size={32} color="#999" />
                <Text className="text-black/60 text-sm mt-3 mb-4 text-center">
                  Faça login para comentar
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/auth')}
                  className="bg-black px-6 py-3 rounded-xl"
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold">Fazer Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}