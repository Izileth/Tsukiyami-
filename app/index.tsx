import { ScrollView, SafeAreaView, Button } from "react-native";
import { StatusBar } from "expo-status-bar";
import { usePosts } from "@/context/PostsContext";
import { Hero } from "@/components/home/Hero";
import { Loading } from "@/components/home/Loading";
import { PostList } from "@/components/home/PostList";
import Toast from "react-native-toast-message";
import { schedulePushNotification } from "@/utils/notifications";

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
        <Button title="Show Toast" onPress={() => Toast.show({
          type: 'success',
          text1: 'Hello',
          text2: 'This is a success toast'
        })} />
        <Button title="Show Notification" onPress={() => schedulePushNotification("My Notification", "This is a local notification!")} />
        <PostList posts={posts} />
      </ScrollView>
    </SafeAreaView>
  );
}