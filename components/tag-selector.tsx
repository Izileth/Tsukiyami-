import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '@/utils/supabase';

interface Tag {
  id: number;
  name: string;
}

interface TagSelectorProps {
  selectedTags: number[];
  onSelectionChange: (selectedIds: number[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onSelectionChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');

  const fetchTags = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tags').select('*');
    if (data) {
      setTags(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleToggleTag = (id: number) => {
    const isSelected = selectedTags.includes(id);
    if (isSelected) {
      onSelectionChange(selectedTags.filter(tagId => tagId !== id));
    } else {
      onSelectionChange([...selectedTags, id]);
    }
  };

  const handleAddTag = async () => {
    if (newTag.trim() === '') return;
    const { data, error } = await supabase.from('tags').insert({ name: newTag.trim() }).select();
    if (data) {
      setTags([...tags, data[0]]);
      onSelectionChange([...selectedTags, data[0].id]);
      setNewTag('');
    } else {
      console.error('Error creating tag:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text className="font-bold mb-2">Tags</Text>
      <View className="flex-row flex-wrap">
        {tags.map(tag => (
          <TouchableOpacity
            key={tag.id}
            onPress={() => handleToggleTag(tag.id)}
            className={`p-2 rounded-lg m-1 ${selectedTags.includes(tag.id) ? 'bg-black' : 'bg-gray-200'}`}
          >
            <Text className={selectedTags.includes(tag.id) ? 'text-white' : 'text-black'}>{tag.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-row mt-2">
        <TextInput
          placeholder="New Tag"
          value={newTag}
          onChangeText={setNewTag}
          className="flex-1 border border-gray-300 rounded-lg p-2"
        />
        <TouchableOpacity onPress={handleAddTag} className="bg-black p-2 px-4 rounded-lg ml-2">
          <Text className="text-white">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TagSelector;
