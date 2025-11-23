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

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;
    await onAddComment(newComment.trim());
    setNewComment('');
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
    <View className="px-6 mt-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Ionicons name="chatbubbles-outline" size={26} color="#000" />
            <Text className="text-2xl font-bold text-black ml-3">
              Comments
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
                        <Text className="font-semibold text-gray-600">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSaveEdit} className="bg-black px-4 py-2 rounded-lg ml-2">
                        <Text className="font-semibold text-white">Save</Text>
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
          <View className="bg-transparent rounded-2xl p-10 items-center  mb-6">
            <Ionicons name="chatbubble-outline" size={40} color="#999" />
            <Text className="text-black/50 text-sm mt-3 text-center">
              Be the first to comment
            </Text>
          </View>
        )}

        {/* Add Comment Input */}
        {profile ? (
          <View className="bg-white border-2 border-gray-200 rounded-2xl p-4 mb-8">
            <Text className="text-xs text-black/70 mb-3 tracking-wider uppercase font-semibold">
              Add a Comment
            </Text>
            <View className="flex-row items-start">
              <View className="flex-1 mr-3">
                <TextInput
                  placeholder="Write your comment..."
                  placeholderTextColor="#999"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  className="bg-gray-50 border-2 border-gray-200 focus:border-black rounded-xl px-4 py-3 text-base min-h-[100px] text-black"
                  textAlignVertical="top"
                />
              </View>
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!newComment.trim() || commentsLoading}
                className={`w-12 h-12 rounded-xl justify-center items-center ${newComment.trim() && !commentsLoading ? 'bg-black' : 'bg-gray-300'}`}
                activeOpacity={0.7}
              >
                <Ionicons name="send" size={20} color={newComment.trim() && !commentsLoading ? '#fff' : '#999'}/>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
           <View className="bg-gray-50 rounded-2xl p-6 items-center border border-gray-200 mb-8">
            <Ionicons name="lock-closed-outline" size={32} color="#999" />
            <Text className="text-black/60 text-sm mt-3 mb-4 text-center">
              Log in to comment
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth')} className="bg-black px-6 py-3 rounded-xl" activeOpacity={0.7}>
              <Text className="text-white font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );
}

