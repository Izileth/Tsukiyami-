import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { usePosts } from "@/context/PostsContext";

export default function HomeScreen() {
  const { posts, loading } = usePosts();

  return (
    <View className="bg-slate-50 flex-1 w-full">
      <ScrollView className="flex-1 w-full" contentContainerClassName="items-center justify-center p-4">
        <Text className="text-black text-2xl font-bold mb-4">All Posts</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          posts.map(post => (
            <Link key={post.id} href={`/post/${post.slug}/`} asChild>
              <TouchableOpacity className="w-full bg-white p-4 rounded-lg mb-4 border border-gray-200">
                <Text className="text-black text-lg font-bold">{post.title}</Text>
                <Text className="text-gray-500 mt-1">{post.description}</Text>
                <Text className="text-gray-400 text-xs mt-2">By: {post.user_id}</Text>
              </TouchableOpacity>
            </Link>
          ))
        )}
        <Link href="/profile" className="mt-4 px-4 py-2 bg-blue-500 rounded">
          <Text className="text-white">Go to Profile</Text>
        </Link>
      </ScrollView>
    </View>
  );
}

