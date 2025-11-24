import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Comment } from '@/context/CommentsContext';
import { Profile } from '@/context/ProfileContext';

interface CommentsSectionProps {
  comments: Comment[];
  profile: Profile | null;
  commentsLoading: boolean;
  onAddComment: (comment: string) => Promise<void>;
  onUpdateComment: (commentId: number, content: string) => Promise<any>;
  onDeleteComment: (commentId: number) => Promise<any>;
}

export function CommentsSection({
  comments,
  profile,
  commentsLoading,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: CommentsSectionProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;
    await onAddComment(newComment.trim());
    setNewComment('');
    setIsFocused(false);
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingCommentId || editingContent.trim() === '') return;
    await onUpdateComment(editingCommentId, editingContent.trim());
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDelete = (commentId: number) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => onDeleteComment(commentId),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View className="px-6 mt-8 mb-20 flex-1">
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

      {/* Add Comment Input - Moved to top */}
      {profile ? (
        <View className="mb-8">
          <View className="flex-row items-start gap-3">
            {/* Avatar do usuário */}
            <View className="w-10 h-10 bg-black rounded-full justify-center items-center mt-1">
              <Text className="text-white text-sm font-bold">
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>

            {/* Input e botão */}
            <View className="flex-1">
              <View className={`${isFocused ? 'bg-gray-50' : 'bg-transparent'} rounded-2xl transition-colors`}>
                <TextInput
                  placeholder="Conte sua experiência..."
                  placeholderTextColor="#999"
                  value={newComment}
                  onChangeText={setNewComment}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => !newComment.trim() && setIsFocused(false)}
                  multiline
                  className="text-black text-base leading-6 px-4 py-3 min-h-[48px]"
                  style={{ maxHeight: 120 }}
                  textAlignVertical="top"
                />
              </View>

              {/* Linha divisória sutil */}
              <View className={`h-[1px] ${isFocused || newComment.trim() ? 'bg-black' : 'bg-gray-200'} mx-4 transition-colors`} />

              {/* Ações (aparecem quando há texto ou foco) */}
              {(isFocused || newComment.trim()) && (
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-xs text-black/40 tracking-wide">
                    {newComment.length}/500
                  </Text>

                  <View className="flex-row items-center gap-2">
                    {newComment.trim() && (
                      <TouchableOpacity
                        onPress={() => {
                          setNewComment('');
                          setIsFocused(false);
                        }}
                        className="px-4 py-2"
                        activeOpacity={0.6}
                      >
                        <Text className="text-sm font-semibold text-black/50">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={handleAddComment}
                      disabled={!newComment.trim() || commentsLoading}
                      className={`flex-row items-center gap-2 px-5 py-2.5 rounded-full ${newComment.trim() && !commentsLoading
                          ? 'bg-black'
                          : 'bg-gray-200'
                        }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-bold tracking-wide ${newComment.trim() && !commentsLoading
                            ? 'text-white'
                            : 'text-black/30'
                          }`}
                      >
                        POST
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={newComment.trim() && !commentsLoading ? '#fff' : '#00000050'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View className="bg-gray-50 rounded-2xl p-6 items-center border border-gray-200 mb-8">
          <Ionicons name="lock-closed-outline" size={32} color="#999" />
          <Text className="text-black/60 text-sm mt-3 mb-4 text-center">
            Faça login para comentar
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth')} className="bg-black px-6 py-3 rounded-xl" activeOpacity={0.7}>
            <Text className="text-white font-semibold">Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <View className="mb-6">
          {comments.map(comment => (
            <View
              key={comment.id}
              className="bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-100"
            >
              <View className="flex-row items-start mb-2">
                <TouchableOpacity onPress={() => router.push(`/profile/${comment.profiles?.slug}`)}>
                  <View className="w-8 h-8 bg-black rounded-full justify-center items-center mr-3">
                    <Text className="text-white text-xs font-bold">
                      {comment.profiles?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View className="flex-1">
                  <Text className="text-black font-bold text-sm">
                    {comment.profiles?.name || 'User'}
                  </Text>
                  <Text className="text-black/40 text-xs mt-1">
                    {new Date(comment.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {comment.updated_at > comment.created_at && ' (edited)'}
                  </Text>
                </View>

                {/* Edit/Delete Buttons */}
                {profile?.id === comment.user_id && editingCommentId !== comment.id && (
                  <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => handleStartEdit(comment)} className="p-1">
                      <Ionicons name="pencil" size={16} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(comment.id)} className="p-1 ml-2">
                      <Ionicons name="trash-outline" size={16} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Comment Content or Edit Input */}
              {editingCommentId === comment.id ? (
                <View className="ml-11">
                  <TextInput
                    value={editingContent}
                    onChangeText={setEditingContent}
                    multiline
                    autoFocus
                    className="bg-white border-2 border-black rounded-xl px-4 py-3 text-base min-h-[80px] text-black"
                    textAlignVertical="top"
                  />
                  <View className="flex-row justify-end mt-2">
                    <TouchableOpacity onPress={handleCancelEdit} className="px-4 py-2 rounded-lg">
                      <Text className="font-semibold text-gray-600">Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveEdit} className="bg-black px-4 py-2 rounded-lg ml-2">
                      <Text className="font-semibold text-white">Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text className="text-black/70 text-sm leading-6 ml-11">
                  {comment.content}
                </Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View className="bg-transparent rounded-2xl p-10 items-center mb-6">
          <Ionicons name="chatbubble-outline" size={40} color="#999" />
          <Text className="text-black/50 text-sm mt-3 text-center">
            Seja o primeiro a comentar!
          </Text>
        </View>
      )}
    </View>
  );
}