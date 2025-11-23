import React from 'react';
import { View } from 'react-native';
import { Post } from '@/types';
import { PostCard } from './PostCard';
import { EmptyFeed } from './EmptyFeed';

interface PostListProps {
  posts: Post[];
}

export const PostList = ({ posts }: PostListProps) => {
  if (posts.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <View className="px-6 pt-6">
      {posts.map((post, index) => (
        <React.Fragment key={post.id}>
          <PostCard post={post} />
          {index !== posts.length - 1 && (
            <View className="w-full h-px bg-gray-100 mt-8" />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};
