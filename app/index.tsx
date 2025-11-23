import { ScrollView, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { usePosts } from "@/context/PostsContext";
import { Hero } from "@/components/home/Hero";
import { Loading } from "@/components/home/Loading";
import { PostList } from "@/components/home/PostList";

export default function HomeScreen() {
  const { posts, loading } = usePosts();

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Hero />
        <PostList posts={posts} />
      </ScrollView>
    </SafeAreaView>
  );
}