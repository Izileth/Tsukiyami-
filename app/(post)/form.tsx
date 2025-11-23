import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, ScrollView, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import slugify from 'slugify';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { usePosts, Post, PostImage, Category, Tag } from '@/context/PostsContext';
import { useProfile } from '@/context/ProfileContext';
import { useStorage } from '@/hooks/use-storage';
import { supabase } from '@/utils/supabase';
import { CreatableSelector, Item } from '@/components/CreatableSelector';
import ImageCarousel from '@/components/image-carousel';

export default function PostFormScreen() {
  const { posts, createPost, updatePost } = usePosts();
  const { profile } = useProfile();
  const { uploadMultipleImages, uploading: imagesUploading } = useStorage();
  const router = useRouter();
  
  // Correção 1: Tipagem correta do useLocalSearchParams
  const params = useLocalSearchParams();
  const postId = typeof params.postId === 'string' ? params.postId : undefined;
  
  const [post, setPost] = useState<Post | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  
  // Image State
  const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  // Category & Tag State
  const [allCategories, setAllCategories] = useState<Item[]>([]);
  const [allTags, setAllTags] = useState<Item[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Item[]>([]);
  const [selectedTags, setSelectedTags] = useState<Item[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch initial dependencies (categories, tags, and post if editing)
  useEffect(() => {
    const initializeForm = async () => {
      setIsInitializing(true);
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          supabase.from('categories').select('id, name'),
          supabase.from('tags').select('id, name'),
        ]);

        if (categoriesRes.data) setAllCategories(categoriesRes.data);
        if (tagsRes.data) setAllTags(tagsRes.data);
        
        // Correção 2: Usar posts.find() ao invés de getPostById
        if (postId) {
          const postToEdit = posts.find(p => p.id === parseInt(postId, 10));
          if (postToEdit) {
            setPost(postToEdit);
            setTitle(postToEdit.title);
            setContent(postToEdit.content || '');
            setDescription(postToEdit.description || '');
            setSlug(postToEdit.slug);
            
            // Correção 3: Tipagem explícita dos parâmetros no .map()
            setExistingImageUrls(
              postToEdit.post_images?.map((img: PostImage) => img.image_url) || []
            );
            setSelectedCategories(
              postToEdit.categories?.map((cat: Category) => ({ id: cat.id, name: cat.name })) || []
            );
            setSelectedTags(
              postToEdit.tags?.map((tag: Tag) => ({ id: tag.id, name: tag.name })) || []
            );
          } else {
            Alert.alert("Error", "Post not found.");
            router.back();
          }
        }
      } catch (error) {
        console.error("Failed to initialize form", error);
        Alert.alert("Error", "Failed to load form data.");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeForm();
  }, [postId, posts]);

  // Auto-generate slug from title for new posts
  useEffect(() => {
    if (!post) {
      setSlug(slugify(title, { lower: true, strict: true, trim: true }));
    }
  }, [title, post]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
      base64: true,
    });

    if (!result.canceled) {
      setNewImages(result.assets);
    }
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingImageUrls(existingImageUrls.filter(u => u !== url));
  }

  const handleSubmit = async () => {
    if (!profile || !title) {
      Alert.alert("Validation Error", "Title is required.");
      return;
    }
    setIsLoading(true);

    try {
      const newImageUrls = await uploadMultipleImages('posts', newImages);

      const createNewItems = async (items: Item[], tableName: 'categories' | 'tags') => {
        const newItems = items.filter(item => item.id === null);
        if (newItems.length === 0) return [];
        
        const { data, error } = await supabase
          .from(tableName)
          .insert(newItems.map(i => ({ name: i.name })))
          .select('id, name');
        
        if (error) throw new Error(`Failed to create ${tableName}: ${error.message}`);
        return data || [];
      };

      const newCreatedCategories = await createNewItems(selectedCategories, 'categories');
      const newCreatedTags = await createNewItems(selectedTags, 'tags');
      
      const getFinalIds = (selected: Item[], newlyCreated: Item[]) => {
        const existingIds = selected.filter(i => i.id !== null).map(i => i.id as number);
        const newIds = newlyCreated.map(i => i.id as number);
        return [...new Set([...existingIds, ...newIds])];
      };

      const finalCategoryIds = getFinalIds(selectedCategories, newCreatedCategories);
      const finalTagIds = getFinalIds(selectedTags, newCreatedTags);

      const postData = {
        user_id: profile.id,
        title,
        content,
        description,
        slug,
        likes_count: post?.likes_count || 0,
        dislikes_count: post?.dislikes_count || 0,
        views_count: post?.views_count || 0,
        comments_count: post?.comments_count || 0,
      };

      if (post) {
        const finalImageUrls = [...existingImageUrls, ...newImageUrls];
        await updatePost(post.id, postData, finalImageUrls, finalCategoryIds, finalTagIds);
        Alert.alert("Success", "Post updated successfully!");
      } else {
        await createPost(postData, newImageUrls, finalCategoryIds, finalTagIds);
        Alert.alert("Success", "Post created successfully!");
      }

      router.back();
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  const isSubmitting = isLoading || imagesUploading || isInitializing;
  const newImageUris = newImages.map(i => i.uri);
  const allImageUris = [...existingImageUrls, ...newImageUris];

  if (isInitializing) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-500">Loading Form...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold mb-6 text-black">
          {post ? 'Edit Post' : 'Create New Post'}
        </Text>

        <View className="mb-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">
            Title
          </Text>
          <TextInput
            placeholder="A catchy title for your post"
            value={title}
            onChangeText={setTitle}
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
          />
        </View>

        <View className="mb-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">
            Images
          </Text>
          {allImageUris.length > 0 && (
            <ImageCarousel 
              images={allImageUris} 
              onRemoveImage={handleRemoveExistingImage} 
            />
          )}
          <TouchableOpacity 
            onPress={handleImagePick} 
            className="mt-2 flex-row items-center justify-center w-full py-3 rounded-xl bg-gray-100 border border-gray-300"
          >
            <Ionicons name="camera" size={20} color="black" />
            <Text className="text-black font-bold ml-2">
              {newImages.length > 0 ? `${newImages.length} new images selected` : 'Select Images'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">
            Short Description
          </Text>
          <TextInput
            placeholder="A brief summary of your post"
            value={description}
            onChangeText={setDescription}
            multiline
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black min-h-[80px]"
            textAlignVertical='top'
          />
        </View>

        <CreatableSelector
          label="Category"
          placeholder="Choose or create a category"
          allAvailableItems={allCategories}
          selectedItems={selectedCategories}
          onSelectionChange={setSelectedCategories}
          isSingleSelection={true}
        />
        
        <CreatableSelector
          label="Tags"
          placeholder="Add up to 5 tags..."
          allAvailableItems={allTags}
          selectedItems={selectedTags}
          onSelectionChange={setSelectedTags}
        />

        <View className="mb-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">
            Content
          </Text>
          <TextInput
            placeholder="Write your main content here..."
            value={content}
            onChangeText={setContent}
            multiline
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black min-h-[200px]"
            textAlignVertical='top'
          />
        </View>

        <View className="mb-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">
            URL Slug
          </Text>
          <TextInput
            placeholder="your-post-slug"
            value={slug}
            onChangeText={setSlug}
            autoCapitalize='none'
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
          />
        </View>
        
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity 
            onPress={() => router.back()} 
            disabled={isSubmitting} 
            className="flex-1 py-4 rounded-xl border-2 border-gray-300"
          >
            <Text className="text-black font-semibold text-center">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={isSubmitting} 
            className="flex-1 py-4 rounded-xl bg-black"
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-center">
                {post ? 'Update Post' : 'Publish Post'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}