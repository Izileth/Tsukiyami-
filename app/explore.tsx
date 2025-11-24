import React, { useState, useEffect } from "react";
import { ScrollView, SafeAreaView, StatusBar, View, Text } from "react-native";
import { usePosts } from "@/context/PostsContext";
import { Loading } from "@/components/home/Loading";
import { PostList } from "@/components/home/PostList";
import { SearchBar } from "@/components/SearchBar";

export default function ExploreScreen() {
  const { loading, searchPosts, searchResults, fetchPosts } = usePosts();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    // Initial fetch of posts when component mounts,
    // or if we want to show all posts when search is empty
    if (searchText === "") {
      fetchPosts();
    }
  }, [searchText, fetchPosts]);

  const handleSearch = () => {
    if (searchText.trim() !== "") {
      searchPosts(searchText);
    } else {
      fetchPosts(); // If search text is empty, show all posts
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SearchBar
        searchText={searchText}
        onSearchTextChange={setSearchText}
        onSearchSubmit={handleSearch}
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {searchResults.length === 0 && searchText.trim() !== "" ? (
          <View className="flex-1 items-center justify-center mt-8">
            <Text className="text-gray-500 text-lg">Nenhum post encontrado para {searchText}.</Text>
          </View>
        ) : (
          <PostList posts={searchResults} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}



