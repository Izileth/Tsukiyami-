import React, { useState, useEffect } from 'react';
import { ScrollView, ActivityIndicator, SafeAreaView, View } from 'react-native';
import { useProfile, Profile } from '@/context/ProfileContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/utils/supabase';
import { ActionButtons } from '@/components/profile/edit/ActionButtons';
import { EditForm } from '@/components/profile/edit/EditForm';
import Toast from 'react-native-toast-message';
const initialFormData = {
  first_name: '',
  last_name: '',
  name: '',
  slug: '',
  email: '',
  bio: '',
  position: '',
  location: '',
  website: '',
  birth_date: '',
  social_media_links: {
    twitter: '',
    github: '',
    linkedin: '',
  },
};

export default function EditProfileScreen() {
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const router = useRouter();

  const [formData, setFormData] = useState(initialFormData);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        name: profile.name || '',
        slug: profile.slug || '',
        email: profile.email || '',
        bio: profile.bio || '',
        position: profile.position || '',
        location: profile.location || '',
        website: profile.website || '',
        birth_date: profile.birth_date || '',
        social_media_links: {
          twitter: profile.social_media_links?.twitter || '',
          github: profile.social_media_links?.github || '',
          linkedin: profile.social_media_links?.linkedin || '',
        },
      });
    }
  }, [profile]);

  const handleUpdate = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
        position: 'top',
        visibilityTime: 5000
      })
      return;
    }

    setIsUpdating(true);
    try {
      const profileUpdates: Partial<Profile> = {
        ...formData,
        birth_date: formData.birth_date || null,
      };
      await updateProfile(profileUpdates);

      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) {
          throw new Error(`Password update failed: ${passwordError.message}`);
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully',
        position: 'top',
        visibilityTime: 5000
      })
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'top',
        visibilityTime: 5000
      })
    } finally {
      setIsUpdating(false);
    }
  };

  if (profileLoading && !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView 
        className="flex-1 px-6 pt-6" 
        showsVerticalScrollIndicator={false}
      >
        <EditForm 
          formData={formData}
          setFormData={setFormData}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />

        <ActionButtons 
          isUpdating={isUpdating}
          onSave={handleUpdate}
          onCancel={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}