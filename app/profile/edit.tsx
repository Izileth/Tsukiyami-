import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useProfile } from '@/context/ProfileContext';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const FormField = ({ 
  label, 
  icon,
  children 
}: { 
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) => (
  <View className="mb-5">
    <View className="flex-row items-center mb-3">
      <View className="bg-gray-100 p-2 rounded-lg mr-3">
        <Ionicons name={icon} size={16} color="#000000" />
      </View>
      <Text className="text-black text-sm font-semibold uppercase tracking-wide">{label}</Text>
    </View>
    {children}
  </View>
);

export default function EditProfileScreen() {
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setSlug(profile.slug || '');
      setEmail(profile.email || '');
      setBio(profile.bio || '');
      setPosition(profile.position || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
      setBirthDate(profile.birth_date || '');
    }
  }, [profile]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        slug,
        email,
        bio,
        position,
        location,
        website,
        birth_date: birthDate || null,
      });
      Alert.alert('Success', 'Profile updated successfully!');
      if (router.canGoBack()) {
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to update profile: ${error.message}`);
    } finally {
      setUpdating(false);
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
        {/* Personal Information Section */}
        <View className="mb-6 mt-16">
          <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">Personal Information</Text>
          
          <FormField label="First Name" icon="person-outline">
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
              placeholder="Enter your first name"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
            />
          </FormField>

          <FormField label="Last Name" icon="person-outline">
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
              placeholder="Enter your last name"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
            />
          </FormField>

          <FormField label="Birth Date" icon="calendar-outline">
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={birthDate}
              onChangeText={setBirthDate}
            />
            <Text className="text-gray-500 text-xs mt-2">Format: YYYY-MM-DD (e.g., 1990-01-15)</Text>
          </FormField>
        </View>

        {/* Account Information Section */}
        <View className="mb-6">
          <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">Account Information</Text>
          
          <FormField label="Username (Slug)" icon="at-outline">
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
              placeholder="your-unique-username"
              placeholderTextColor="#9CA3AF"
              value={slug}
              onChangeText={setSlug}
              autoCapitalize="none"
            />
            <Text className="text-gray-500 text-xs mt-2">This will be your profile URL: @{slug || 'username'}</Text>
          </FormField>

          <FormField label="Email" icon="mail-outline">
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
              placeholder="your@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </FormField>
        </View>

        {/* Professional Information Section */}
        <View className="mb-6">
          <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">Professional Information</Text>
          
          <FormField label="Position" icon="briefcase-outline">
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
              placeholder="e.g., Senior Developer"
              placeholderTextColor="#9CA3AF"
              value={position}
              onChangeText={setPosition}
            />
          </FormField>

          <FormField label="Bio" icon="document-text-outline">
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black min-h-[100px]"
              placeholder="Tell us about yourself..."
              placeholderTextColor="#9CA3AF"
              value={bio}
              onChangeText={setBio}
              multiline
              textAlignVertical="top"
            />
            <Text className="text-gray-500 text-xs mt-2">{bio.length}/500 characters</Text>
          </FormField>
        </View>

        {/* Location & Contact Section */}
        <View className="mb-6">
          <Text className="text-black text-lg font-bold mb-4 uppercase tracking-wide">Location & Contact</Text>
          
          <FormField label="Location" icon="location-outline">
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
              placeholder="City, Country"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
          </FormField>

          <FormField label="Website" icon="globe-outline">
            <TextInput
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
              placeholder="https://your-website.com"
              placeholderTextColor="#9CA3AF"
              value={website}
              onChangeText={setWebsite}
              autoCapitalize="none"
              keyboardType="url"
            />
          </FormField>
        </View>

        {/* Action Buttons */}
        <View className="mb-8 gap-3">
          <TouchableOpacity
            className={`w-full py-4 rounded-xl ${updating ? 'bg-gray-400' : 'bg-black'}`}
            onPress={handleUpdate}
            disabled={updating}
          >
            {updating ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold ml-2">Saving Changes...</Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center">
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2">Save Changes</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-4 rounded-xl border-2 border-gray-300"
            onPress={() => router.back()}
            disabled={updating}
          >
            <Text className="text-black font-semibold text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}