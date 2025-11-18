import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/supabase';
import { Alert } from 'react-native';
import { decode } from 'base64-arraybuffer';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (
    bucket: 'avatars' | 'banners',
    onUpload: (url: string) => void
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: bucket === 'avatars' ? [1, 1] : [16, 9],
      quality: 0.8, // Reduzir qualidade para melhor performance
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const image = result.assets[0];
    const base64 = image.base64;

    if (!base64) {
      Alert.alert('Error', 'Could not read image data.');
      return;
    }

    setUploading(true);

    try {
      // Gerar nome único com extensão correta
      const fileExt = image.uri.split('.').pop()?.toLowerCase() || 'jpeg';
      const filePath = `${Date.now()}.${fileExt}`;
      
      console.log('Uploading to bucket:', bucket, 'with path:', filePath);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, decode(base64), {
          contentType: image.mimeType ?? 'image/jpeg',
          upsert: true, // Sobrescrever se já existir
        });

      if (error) {
        console.error('Upload error:', error);
        Alert.alert('Upload Error', error.message);
        return;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log('Generated public URL:', publicUrl);

      onUpload(publicUrl);
    } catch (error: any) {
      console.error('Unexpected error:', error);
      Alert.alert('Upload Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  return { uploading, uploadImage };
};