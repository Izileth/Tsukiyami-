import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Comment } from '@/context/CommentsContext';
import { Profile } from '@/context/ProfileContext';

interface CommentsSectionProps {
  comments: Comment[];
  profile: Profile | null;
  commentsLoading: boolean;
  onAddComment: (comment: string) => Promise<void>;
}

export function CommentsSection({
  comments,
  profile,
  commentsLoading,
  onAddComment,
}: CommentsSectionProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState('');
  const [focusedComment, setFocusedComment] = useState(false);

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;
    await onAddComment(newComment.trim());
    setNewComment('');
  };

  return (
    <View className="px-6">
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
                  className={`bg-gray-50 border-2 rounded-xl px-4 py-3 text-base min-h-[100px] ${
                    focusedComment ? 'border-black' : 'border-gray-200'
                  } text-black`}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!newComment.trim() || commentsLoading}
                className={`w-12 h-12 rounded-xl justify-center items-center ${
                  newComment.trim() && !commentsLoading ? 'bg-black' : 'bg-gray-300'
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
  );
}
