import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import slugify from 'slugify';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { usePosts, Post, PostImage, Category, Tag } from '@/context/PostsContext';
import { useProfile } from '@/context/ProfileContext';
import { useStorage } from '@/hooks/use-storage';
import { supabase } from '@/utils/supabase';
import { CreatableSelector, Item } from '@/components/CreatableSelector';
import ImageCarousel from '@/components/image-carousel';
import Toast from 'react-native-toast-message';

export default function PostFormScreen() {
  const { posts, createPost, updatePost } = usePosts();
  const { profile } = useProfile();
  const { uploadMultipleImages, uploading: imagesUploading } = useStorage();
  const router = useRouter();
  const richText = useRef<RichEditor>(null);

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

  // Link Modal State
  const [isAddLinkModalVisible, setAddLinkModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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

        if (postId) {
          const postToEdit = posts.find(p => p.id === parseInt(postId, 10));
          if (postToEdit) {
            setPost(postToEdit);
            setTitle(postToEdit.title);
            setContent(postToEdit.content || '');
            setDescription(postToEdit.description || '');
            setSlug(postToEdit.slug);

            setExistingImageUrls(postToEdit.post_images?.map((img: PostImage) => img.image_url) || []);
            setSelectedCategories(postToEdit.categories?.map((cat: Category) => ({ id: cat.id, name: cat.name })) || []);
            setSelectedTags(postToEdit.tags?.map((tag: Tag) => ({ id: tag.id, name: tag.name })) || []);
          } else {
            Toast.show({ type: 'error', text1: 'Post não encontrado', position: 'top' });
            router.back();
          }
        }
      } catch (error) {
        console.error("Failed to initialize form", error);
        Toast.show({ type: 'error', text1: 'Falha ao inicializar o formulário', position: 'top' });
      } finally {
        setIsInitializing(false);
      }
    };
    initializeForm();
  }, [postId, posts, router]);

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
  };

  const onPressAddLink = () => {
    setAddLinkModalVisible(true);
  };

  const handleAddLink = () => {
    if (linkUrl && richText.current) {
      richText.current.insertLink(linkText || linkUrl, linkUrl);
    }
    setAddLinkModalVisible(false);
    setLinkUrl('');
    setLinkText('');
  };

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

        const { data, error } = await supabase.from(tableName).insert(newItems.map(i => ({ name: i.name }))).select('id, name');
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

      const postData: Omit<Post, "categories" | "tags" | "id" | "created_at" | "updated_at" | "post_images" | "profile"> = {
        user_id: profile.id, title, content, description, slug,
        likes_count: post?.likes_count || 0,
        dislikes_count: post?.dislikes_count || 0,
        views_count: post?.views_count || 0,
        comments_count: post?.comments_count || 0,
      };

      if (post) {
        const finalImageUrls = [...existingImageUrls, ...newImageUrls];
        await updatePost(post.id, postData, finalImageUrls, finalCategoryIds, finalTagIds);
        Toast.show({ type: 'success', text1: 'Postagem atualizada com sucesso', position: 'top' });
      } else {
        await createPost(postData, newImageUrls, finalCategoryIds, finalTagIds);
        Toast.show({ type: 'success', text1: 'Postagem criada com sucesso', position: 'top' });
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
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-2 text-gray-500">Buscando Publicação...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          <Text className="text-3xl font-bold mb-6 text-black">
            {post ? 'Atualizar Publicação' : 'Criar Publicação'}
          </Text>

          <View className="mb-5">
            <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">Titulo</Text>
            <TextInput placeholder="Informe o titulo da publicação" value={title} onChangeText={setTitle} className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black" />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">Imagens</Text>
            {allImageUris.length > 0 && (<ImageCarousel images={allImageUris} onRemoveImage={handleRemoveExistingImage}/>)}
            <TouchableOpacity onPress={handleImagePick} className="mt-2 flex-row items-center justify-center w-full py-3 rounded-xl bg-gray-100 border border-gray-300">
              <Ionicons name="camera" size={20} color="black" />
              <Text className="text-black font-bold ml-2">{newImages.length > 0 ? `${newImages.length} new images selected` : 'Select Images'}</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">Descrição</Text>
            <TextInput placeholder="Escreva uma breve descrição..." value={description} onChangeText={setDescription} multiline className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black min-h-[80px]" textAlignVertical='top' />
          </View>

          <CreatableSelector label="Category" placeholder="Selecione ou crie uma categoria..." allAvailableItems={allCategories} selectedItems={selectedCategories} onSelectionChange={setSelectedCategories} isSingleSelection={true} />
          <CreatableSelector label="Tags" placeholder="Selecione ou crie uma tag..." allAvailableItems={allTags} selectedItems={selectedTags} onSelectionChange={setSelectedTags} />

          <View className="mb-5">
            <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">Conteúdo</Text>
            <RichToolbar
              editor={richText}
              actions={[
                actions.setBold, actions.setItalic, actions.setUnderline, actions.setStrikethrough, 'onPressAddLink',
                actions.heading1, actions.heading2, actions.insertBulletsList, actions.insertOrderedList, actions.indent, actions.outdent,
              ]}
              iconMap={{ onPressAddLink: () => <Ionicons name="link" size={20} color="#000" /> }}
              onPressAddLink={onPressAddLink}
              iconTint={'#000'}
              selectedIconTint={'#2095F2'}
              style={{ backgroundColor: '#f3f4f6', borderRadius: 12, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            />
            <RichEditor
              ref={richText}
              initialContentHTML={content}
              onChange={setContent}
              placeholder="Escreva o conteudo da publicação..."
              containerStyle={{ borderWidth: 1, borderColor: '#d1d5db', borderTopWidth: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, minHeight: 250, backgroundColor: '#f9fafb' }}
              editorStyle={{ contentCSSText: 'color: black;' }}
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">Slug</Text>
            <TextInput placeholder="Informe o slug da publicação" value={slug} onChangeText={setSlug} autoCapitalize='none' className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black" />
          </View>

          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting} className="flex-1 py-4 rounded-xl border-2 border-gray-300">
              <Text className="text-black font-semibold text-center">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} className="flex-1 py-4 rounded-xl bg-black">
              {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-center">{post ? 'Atualizar' : 'Criar'}</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddLinkModalVisible}
        onRequestClose={() => setAddLinkModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-11/12">
            <Text className="text-xl font-bold text-black mb-4">Adicionar Link</Text>
            <TextInput
              placeholder="URL do Link"
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
              keyboardType="url"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-black mb-3"
            />
            <TextInput
              placeholder="Texto a ser exibido (opcional)"
              value={linkText}
              onChangeText={setLinkText}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-black mb-5"
            />
            <View className="flex-row justify-end gap-4">
              <TouchableOpacity onPress={() => { setAddLinkModalVisible(false); setLinkUrl(''); setLinkText(''); }} className="py-3 px-5 rounded-xl border-2 border-gray-200">
                <Text className="text-black font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddLink} className="py-3 px-5 rounded-xl bg-black">
                <Text className="text-white font-bold">Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}