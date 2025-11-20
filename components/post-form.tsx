import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, ScrollView } from 'react-native';
import { usePosts, Post } from '@/context/PostsContext';
import { useProfile } from '@/context/ProfileContext';
import { useStorage } from '@/hooks/use-storage';
import * as ImagePicker from 'expo-image-picker';
import slugify from 'slugify';

import ImageCarousel from './image-carousel';
import CategorySelector from './category-selector';
import TagSelector from './tag-selector';

interface PostFormProps {
  post?: Post | null;
  onClose: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ post, onClose }) => {
  const { createPost, updatePost } = usePosts();
  const { profile } = useProfile();
  const { uploadMultipleImages, uploading: imagesUploading } = useStorage();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setDescription(post.description);
      setSlug(post.slug);
      setImageUrls(post.post_images.map(img => img.image_url));
      setSelectedCategories(post.categories.map(cat => cat.id));
      setSelectedTags(post.tags.map(tag => tag.id));
    }
  }, [post]);

  useEffect(() => {
    if (!post) {
      setSlug(slugify(title, { lower: true, strict: true }));
    }
  }, [title, post]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImages(result.assets);
      setImageUrls(result.assets.map(a => a.uri));
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImages(images.filter(img => img.uri !== uri));
    setImageUrls(imageUrls.filter(url => url !== uri));
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);

    const uploadedImageUrls = await uploadMultipleImages('posts', images);

    const postData = {
      user_id: profile.id,
      title,
      content,
      description,
      slug,
      likes_count: 0,
      dislikes_count: 0,
      views_count: 0,
    };

    if (post) {
      await updatePost(post.id, postData, uploadedImageUrls, selectedCategories, selectedTags);
    } else {
      await createPost(postData, uploadedImageUrls, selectedCategories, selectedTags);
    }

    setLoading(false);
    onClose();
  };

  return (
    <ScrollView className="w-full">
      <Text className="text-xl font-bold mb-4">{post ? 'Edit Post' : 'Create Post'}</Text>

      
      {imageUrls.length > 0 && <ImageCarousel images={imageUrls} onRemoveImage={handleRemoveImage} />}

      <TextInput
        placeholder="Titulo"
        value={title}
        onChangeText={setTitle}
        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black mb-4"
      />
      
      <TouchableOpacity onPress={handleImagePick} className="mb-4 bg-black p-2 rounded-lg">
        <Text className="text-white text-center">Selecionar Imagens</Text>
      </TouchableOpacity>
      
      <TextInput
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black mb-4"
      />

      <TextInput
        placeholder="Conteúdo"
        value={content}
        onChangeText={setContent}
        multiline
        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black mb-4 min-h-[100px]"
      />
      <TextInput
        placeholder="Slug"
        value={slug}
        onChangeText={setSlug}
        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black mb-4"
      />

      <CategorySelector selectedCategories={selectedCategories} onSelectionChange={setSelectedCategories} />
      <View className="my-4" />
      <TagSelector selectedTags={selectedTags} onSelectionChange={setSelectedTags} />

      <TouchableOpacity onPress={handleSubmit} disabled={loading || imagesUploading} className="w-full py-4 rounded-xl bg-black mt-4">
        {loading || imagesUploading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-center">{post ? 'Update' : 'Create'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PostForm;