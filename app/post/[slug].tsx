import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { Post, Category, Tag, PostImage } from '@/context/PostsContext';
import { useProfile } from '@/context/ProfileContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Comment {
  id: number;
  content: string;
  user_id: string;
  created_at: string;
  profiles: { name: string };
}

type PostWithRelations = Post & {
  post_images: PostImage[];
  categories: Category[];
  tags: Tag[];
}

export default function PostScreen() {
  const { slug } = useLocalSearchParams();
  const { profile } = useProfile();
  const router = useRouter();
  const [post, setPost] = useState<PostWithRelations | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [likeStatus, setLikeStatus] = useState<'liked' | 'disliked' | null>(null);
  const [focusedComment, setFocusedComment] = useState(false);

  const fetchPost = async () => {
    if (!slug) return;
    setLoading(true);
    await supabase.rpc('increment_view_count', { post_slug: slug });

    const { data} = await supabase
      .from('posts')
      .select(`
        *,
        post_images ( id, image_url ),
        post_categories ( categories ( id, name ) ),
        post_tags ( tags ( id, name ) )
      `)
      .eq('slug', slug)
      .single();

    if (data) {
      const formattedData = {
        ...data,
        post_images: data.post_images,
        categories: data.post_categories.map((pc: any) => pc.categories),
        tags: data.post_tags.map((pt: any) => pt.tags),
      };
      setPost(formattedData);
      fetchComments(formattedData.id);
      if (profile) {
        fetchLikeStatus(formattedData.id, profile.id);
      }
    }
    setLoading(false);
  };

  const fetchComments = async (postId: number) => {
    const { data } = await supabase.from('comments').select(`*, profiles ( name )`).eq('post_id', postId).order('created_at', { ascending: true });
    if (data) setComments(data as Comment[]);
  };

  const fetchLikeStatus = async (postId: number, userId: string) => {
    const { data: likeData } = await supabase.from('likes').select('*').eq('post_id', postId).eq('user_id', userId).single();
    if (likeData) {
      setLikeStatus('liked');
      return;
    }
    const { data: dislikeData } = await supabase.from('dislikes').select('*').eq('post_id', postId).eq('user_id', userId).single();
    if (dislikeData) {
      setLikeStatus('disliked');
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const handleAddComment = async () => {
    if (!profile || !post || newComment.trim() === '') return;
    const { data } = await supabase.from('comments').insert({ post_id: post.id, user_id: profile.id, content: newComment.trim() }).select(`*, profiles ( name )`);
    if (data) {
      setComments([...comments, data[0] as Comment]);
      setNewComment('');
    }
  };

  const handleLike = async () => {
    if (!profile || !post) return;
    if (likeStatus === 'liked') {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', profile.id);
      setPost(p => p ? { ...p, likes_count: p.likes_count - 1 } : null);
      setLikeStatus(null);
    } else {
      if (likeStatus === 'disliked') {
        await supabase.from('dislikes').delete().eq('post_id', post.id).eq('user_id', profile.id);
        setPost(p => p ? { ...p, dislikes_count: p.dislikes_count - 1 } : null);
      }
      await supabase.from('likes').insert({ post_id: post.id, user_id: profile.id });
      setPost(p => p ? { ...p, likes_count: p.likes_count + 1 } : null);
      setLikeStatus('liked');
    }
  };

  const handleDislike = async () => {
    if (!profile || !post) return;
    if (likeStatus === 'disliked') {
      await supabase.from('dislikes').delete().eq('post_id', post.id).eq('user_id', profile.id);
      setPost(p => p ? { ...p, dislikes_count: p.dislikes_count - 1 } : null);
      setLikeStatus(null);
    } else {
      if (likeStatus === 'liked') {
        await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', profile.id);
        setPost(p => p ? { ...p, likes_count: p.likes_count - 1 } : null);
      }
      await supabase.from('dislikes').insert({ post_id: post.id, user_id: profile.id });
      setPost(p => p ? { ...p, dislikes_count: p.dislikes_count + 1 } : null);
      setLikeStatus('disliked');
    }
  };

  if (loading) {
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
                  <Text className="text-black/70 text-xs font-medium">( +{post.tags.length - 4} )</Text>
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
            >
              <Ionicons
                name={likeStatus === 'liked' ? 'heart' : 'heart-outline'}
                size={20}
                color={likeStatus === 'liked' ? '#000' : '#666'}
              />
              <Text
                className={`text-sm ml-2 font-medium ${likeStatus === 'liked' ? 'text-black' : 'text-black/60'
                  }`}
              >
                {post.likes_count}
              </Text>
            </TouchableOpacity>

            {/* Dislike */}
            <TouchableOpacity
              onPress={handleDislike}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <Ionicons
                name={
                  likeStatus === 'disliked'
                    ? 'heart-dislike'
                    : 'heart-dislike-outline'
                }
                size={20}
                color={likeStatus === 'disliked' ? '#000' : '#666'}
              />
              <Text
                className={`text-sm ml-2 font-medium ${likeStatus === 'disliked' ? 'text-black' : 'text-black/60'
                  }`}
              >
                {post.dislikes_count}
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
                <Text className="text-2xl font-bold text-black ml-3">Comentários</Text>
              </View>
              <View className="bg-black px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-bold">{comments.length}</Text>
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
                          {comment.profiles.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <View className="flex-1">
                        <Text className="text-black font-bold text-sm">
                          {comment.profiles.name}
                        </Text>

                        <Text className="text-black/40 text-xs mt-1">
                          {new Date(comment.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                      className={`bg-gray-50 border-2 rounded-xl px-4 py-3 text-base min-h-[100px] ${focusedComment ? "border-black" : "border-gray-200"
                        } text-black`}
                      textAlignVertical="top"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleAddComment}
                    disabled={!newComment.trim()}
                    className={`w-12 h-12 rounded-xl justify-center items-center ${newComment.trim() ? "bg-black" : "bg-gray-300"
                      }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={newComment.trim() ? "#fff" : "#999"}
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
                  onPress={() => router.push("/auth")}
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