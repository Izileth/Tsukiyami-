import React from 'react';
import { View } from 'react-native';
import { StatCard } from './StatCard';

interface StatsProps {
  postsCount: number;
  followerCount: number;
  followingCount: number;
}

export const Stats = ({ postsCount, followerCount, followingCount }: StatsProps) => (
  <View className="px-6 mb-6">
    <View className="flex-row gap-3">
      <StatCard number={postsCount.toString()} label="Publicações" />
      <StatCard number={followerCount.toString()} label="Seguidores" />
      <StatCard number={followingCount.toString()} label="Seguindo" />
    </View>
  </View>
);
