import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '@/utils/supabase';

interface Category {
  id: number;
  name: string;
}

interface CategorySelectorProps {
  selectedCategories: number[];
  onSelectionChange: (selectedIds: number[]) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategories, onSelectionChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*');
    if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleCategory = (id: number) => {
    const isSelected = selectedCategories.includes(id);
    if (isSelected) {
      onSelectionChange(selectedCategories.filter(catId => catId !== id));
    } else {
      onSelectionChange([...selectedCategories, id]);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() === '') return;
    const { data, error } = await supabase.from('categories').insert({ name: newCategory.trim() }).select();
    if (data) {
      setCategories([...categories, data[0]]);
      onSelectionChange([...selectedCategories, data[0].id]);
      setNewCategory('');
    } else {
      console.error('Error creating category:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text className="font-bold mb-2">Categories</Text>
      <View className="flex-row flex-wrap">
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleToggleCategory(category.id)}
            className={`p-2 rounded-lg m-1 ${selectedCategories.includes(category.id) ? 'bg-black' : 'bg-gray-200'}`}
          >
            <Text className={selectedCategories.includes(category.id) ? 'text-white' : 'text-black'}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-row mt-2">
        <TextInput
          placeholder="Nova Categoria"
          value={newCategory}
          onChangeText={setNewCategory}
          className="flex-1 border border-gray-300 rounded-lg p-2"
        />
        <TouchableOpacity onPress={handleAddCategory} className="bg-black p-2 px-4 rounded-lg ml-2">
          <Text className="text-white">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CategorySelector;
