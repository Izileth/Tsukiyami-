import React from 'react';
import { View, TextInput} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SearchBarProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchSubmit: () => void;
}

export function SearchBar({ searchText, onSearchTextChange, onSearchSubmit }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-transparent border border-gray-300 border-opacity-50  rounded-xl px-3 py-2 mx-4 mt-4">
      <Feather name="search" size={20} color="gray" />
      <TextInput
        className="flex-1 ml-2 text-base"
        placeholder="Search posts or users..."
        value={searchText}
        onChangeText={onSearchTextChange}
        onSubmitEditing={onSearchSubmit}
        returnKeyType="search"
      />
    </View>
  );
}