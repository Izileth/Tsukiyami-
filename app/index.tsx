import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, SafeAreaView } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { usePosts } from "@/context/PostsContext";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const { posts, loading } = usePosts();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-black/50 text-sm mt-4">Carregando posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Hero Section */}
        <View className="px-6 pt-8 pb-6 border-b border-gray-100">
          <Text className="text-4xl font-bold text-black mb-2 tracking-tight">
            Feed
          </Text>
          <Text className="text-base text-black/50">
            Explore as últimas publicações da comunidade
          </Text>
        </View>

        {/* Posts Grid */}
        <View className="px-6 pt-6">
          {posts.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Ionicons name="document-outline" size={64} color="#CCCCCC" />
              <Text className="text-black/50 text-base mt-4">
                Nenhum post encontrado
              </Text>
            </View>
          ) : (
            posts.map((post, index) => {
              // As contagens agora vêm diretamente do objeto post
              const displayViews = post.views_count || 0;
              const displayLikes = post.likes_count || 0;
              const displayDislikes = post.dislikes_count || 0;

              return (
                <Link key={post.id} href={{
                  pathname: '/(post)/[slug]',
                  params: { slug: post.slug }
                }} asChild>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="mb-8"
                  >
                    {/* Image Container */}
                    {post.post_images && post.post_images.length > 0 && (
                      <View className="w-full aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden mb-4 border border-gray-200">
                        <Image
                          source={{ uri: post.post_images[0].image_url }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                    )}

                    {/* Content Container */}
                  <View className="px-1">
                    {/* Author Info */}
                    {post.profile && (
                      <Link href={{
                        pathname: '/profile/[slug]',
                        params: { slug: post?.profile?.slug  || ''}
                      }} asChild>
                        <TouchableOpacity className="flex-row items-center mb-4">
                          <Image
                            source={{ uri: post.profile.avatar_url || 'https://via.placeholder.com/40' }} // Placeholder for no avatar
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <View>
                            <Text className="text-sm font-semibold text-black">
                              {post.profile.name || post.profile.first_name || 'Usuário Anônimo'}
                            </Text>
                            {post.profile.slug && (
                              <Text className="text-xs text-black/60">
                                @{post.profile.slug}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      </Link>
                    )}

                    {/* Title */}
                    <Text
                      className="text-2xl font-bold text-black mb-3 leading-tight tracking-tight"
                      numberOfLines={2}
                    >
                        {post.title}
                      </Text>

                      {/* Description */}
                      {post.description && (
                        <Text
                          className="text-base text-black/60 mb-4 leading-6"
                          numberOfLines={2}
                        >
                          {post.description}
                        </Text>
                      )}

                      {/* Tags */}
                      {(post.categories.length > 0 || post.tags.length > 0) && (
                        <View className="flex-row flex-wrap mb-4">
                          {post.categories.map(c => (
                            <View
                              key={c.id}
                              className="bg-black px-3 py-1.5 rounded-full mr-2 mb-2"
                            >
                              <Text className="text-white text-xs font-semibold tracking-wide uppercase">
                                {c.name}
                              </Text>
                            </View>
                          ))}
                          {post.tags.slice(0, 3).map(t => (
                            <View
                              key={t.id}
                              className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-full mr-2 mb-2"
                            >
                              <Text className="text-black/70 text-xs font-medium">
                                {t.name}
                              </Text>
                            </View>
                          ))}
                          {post.tags.length > 3 && (
                            <View className="bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-full mr-2 mb-2">
                              <Text className="text-black/70 text-xs font-medium">
                                +{post.tags.length - 3}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Stats Bar */}
                      <View className="flex-row items-center pt-3 border-t border-gray-100">
                        {/* Views */}
                        <View className="flex-row items-center mr-4">
                          <Ionicons name="eye-outline" size={16} color="#666666" />
                          <Text className="text-black/60 text-xs ml-1.5 font-medium">
                            {displayViews.toLocaleString()}
                          </Text>
                        </View>

                        {/* Likes */}
                        <View className="flex-row items-center mr-4">
                          <Ionicons 
                            name="heart" 
                            size={16} 
                            color={displayLikes > 0 ? "#EF4444" : "#666666"} 
                          />
                          <Text 
                            className={`text-xs ml-1.5 font-medium ${
                              displayLikes > 0 ? "text-red-500" : "text-black/60"
                            }`}
                          >
                            {displayLikes}
                          </Text>
                        </View>

                        {/* Dislikes */}
                        <View className="flex-row items-center mr-4">
                          <Ionicons 
                            name="heart-dislike" 
                            size={16} 
                            color={displayDislikes > 0 ? "#6B7280" : "#666666"} 
                          />
                          <Text 
                            className={`text-xs ml-1.5 font-medium ${
                              displayDislikes > 0 ? "text-gray-500" : "text-black/60"
                            }`}
                          >
                            {displayDislikes}
                          </Text>
                        </View>

                        {/* Comments */}
                        <View className="flex-row items-center mr-4">
                          <Ionicons name="chatbubble-outline" size={16} color="#666666" />
                          <Text className="text-black/60 text-xs ml-1.5 font-medium">
                            {post.comments_count || 0}
                          </Text>
                        </View>

                        {/* Spacer */}
                        <View className="flex-1" />

                        {/* Read More Indicator */}
                        <View className="flex-row items-center">
                          <Text className="text-black/40 text-xs font-medium mr-1">
                            Ler mais
                          </Text>
                          <Ionicons name="arrow-forward" size={14} color="#666666" />
                        </View>
                      </View>
                    </View>

                    {/* Divider between posts (except last) */}
                    {index !== posts.length - 1 && (
                      <View className="w-full h-px bg-gray-100 mt-8" />
                    )}
                  </TouchableOpacity>
                </Link>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}