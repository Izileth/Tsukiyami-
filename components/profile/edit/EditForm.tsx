import React from 'react';
import { TextInput, Text } from 'react-native';
import { EditFormSection } from './EditFormSection';
import { FormField } from './FormField';

type SocialLinks = {
  twitter: string;
  github: string;
  linkedin: string;
};

export type FormData = {
  first_name: string;
  last_name: string;
  name: string;
  birth_date: string;
  slug: string;
  email: string;
  position: string;
  bio: string;
  location: string;
  website: string;
  social_media_links: SocialLinks;
};

type EditFormProps = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
};

// ====================
// COMPONENT
// ====================

export function EditForm({
  formData,
  setFormData,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
}: EditFormProps) {

  const handleInputChange =
    (field: keyof FormData) => (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  return (
    <>
      <EditFormSection title="Personal Information">
        <FormField label="First Name" icon="person-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="Enter your first name"
            placeholderTextColor="#9CA3AF"
            value={formData.first_name}
            onChangeText={handleInputChange('first_name')}
          />
        </FormField>

        <FormField label="Last Name" icon="person-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="Enter your last name"
            placeholderTextColor="#9CA3AF"
            value={formData.last_name}
            onChangeText={handleInputChange('last_name')}
          />
        </FormField>

        <FormField label="Full Name" icon="person-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            value={formData.name}
            onChangeText={handleInputChange('name')}
          />
        </FormField>

        <FormField label="Birth Date" icon="calendar-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={formData.birth_date}
            onChangeText={handleInputChange('birth_date')}
          />
          <Text className="text-gray-500 text-xs mt-2">Format: YYYY-MM-DD</Text>
        </FormField>
      </EditFormSection>

      <EditFormSection title="Account Information">
        <FormField label="Username (Slug)" icon="at-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="your-unique-username"
            placeholderTextColor="#9CA3AF"
            value={formData.slug}
            onChangeText={handleInputChange('slug')}
            autoCapitalize="none"
          />
          <Text className="text-gray-500 text-xs mt-2">
            Will be your profile URL: @{formData.slug || 'username'}
          </Text>
        </FormField>

        <FormField label="Email" icon="mail-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="your@email.com"
            placeholderTextColor="#9CA3AF"
            value={formData.email}
            onChangeText={handleInputChange('email')}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </FormField>
      </EditFormSection>

      <EditFormSection title="Professional Information">
        <FormField label="Position" icon="briefcase-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="e.g., Senior Developer"
            placeholderTextColor="#9CA3AF"
            value={formData.position}
            onChangeText={handleInputChange('position')}
          />
        </FormField>

        <FormField label="Bio" icon="document-text-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black min-h-[100px]"
            placeholder="Tell us about yourself..."
            placeholderTextColor="#9CA3AF"
            value={formData.bio}
            onChangeText={handleInputChange('bio')}
            multiline
            textAlignVertical="top"
          />
          <Text className="text-gray-500 text-xs mt-2">
            {formData.bio?.length || 0}/500 characters
          </Text>
        </FormField>
      </EditFormSection>

      <EditFormSection title="Location & Contact">
        <FormField label="Location" icon="location-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="City, Country"
            placeholderTextColor="#9CA3AF"
            value={formData.location}
            onChangeText={handleInputChange('location')}
          />
        </FormField>

        <FormField label="Website" icon="globe-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="https://your-website.com"
            placeholderTextColor="#9CA3AF"
            value={formData.website}
            onChangeText={handleInputChange('website')}
            autoCapitalize="none"
            keyboardType="url"
          />
        </FormField>
      </EditFormSection>

      <EditFormSection title="Social Links">
        <FormField label="Twitter" icon="logo-twitter">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="https://twitter.com/username"
            placeholderTextColor="#9CA3AF"
            value={formData.social_media_links.twitter}
            onChangeText={(v) =>
              setFormData((prev) => ({
                ...prev,
                social_media_links: { ...prev.social_media_links, twitter: v },
              }))
            }
            autoCapitalize="none"
            keyboardType="url"
          />
        </FormField>

        <FormField label="GitHub" icon="logo-github">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="https://github.com/username"
            placeholderTextColor="#9CA3AF"
            value={formData.social_media_links.github}
            onChangeText={(v) =>
              setFormData((prev) => ({
                ...prev,
                social_media_links: { ...prev.social_media_links, github: v },
              }))
            }
            autoCapitalize="none"
            keyboardType="url"
          />
        </FormField>

        <FormField label="LinkedIn" icon="logo-linkedin">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="https://linkedin.com/in/username"
            placeholderTextColor="#9CA3AF"
            value={formData.social_media_links.linkedin}
            onChangeText={(v) =>
              setFormData((prev) => ({
                ...prev,
                social_media_links: { ...prev.social_media_links, linkedin: v },
              }))
            }
            autoCapitalize="none"
            keyboardType="url"
          />
        </FormField>
      </EditFormSection>

      <EditFormSection title="Security">
        <FormField label="New Password" icon="lock-closed-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="Enter new password"
            placeholderTextColor="#9CA3AF"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </FormField>

        <FormField label="Confirm Password" icon="lock-closed-outline">
          <TextInput
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-black"
            placeholder="Confirm new password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </FormField>
      </EditFormSection>
    </>
  );
}
