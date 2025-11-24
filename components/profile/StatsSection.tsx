import React from 'react';
import { View } from 'react-native';
import { Post } from '@/context/PostsContext';
import { StatCard } from './StatCard';

interface StatsSectionProps {
  posts: Post[];
  userId?: string;
  followerCount: number;
  followingCount: number;
}

export function StatsSection({ posts, userId, followerCount, followingCount }: StatsSectionProps) {
  const userPostsCount = posts.filter((p) => p.user_id === userId).length;

  return (
    <View className="mb-6 px-6">
      <View className="flex-row gap-3">
        <StatCard number={userPostsCount.toString()} label="Publicações" />
        <StatCard number={followerCount.toString()} label="Seguidores" />
        <StatCard number={followingCount.toString()} label="Seguindo" />
      </View>
    </View>
  );
}
