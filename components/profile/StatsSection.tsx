import React from 'react';
import { View } from 'react-native';
import { Post } from '@/context/PostsContext';
import { StatCard } from './StatCard';

interface StatsSectionProps {
  posts: Post[];
  userId?: string;
}

export function StatsSection({ posts, userId }: StatsSectionProps) {
  const userPostsCount = posts.filter((p) => p.user_id === userId).length.toString();

  return (
    <View className="mb-6 px-6">
      <View className="flex-row gap-3">
        <StatCard number={userPostsCount} label="Posts" />
        <StatCard number="0" label="Followers" />
        <StatCard number="0" label="Following" />
      </View>
    </View>
  );
}
