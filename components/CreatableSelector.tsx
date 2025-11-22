import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Item {
  id: number | null;
  name: string;
}

interface CreatableSelectorProps {
  label: string;
  placeholder: string;
  allAvailableItems: Item[];
  selectedItems: Item[];
  onSelectionChange: (items: Item[]) => void;
  isSingleSelection?: boolean;
}

export function CreatableSelector({
  label,
  placeholder,
  allAvailableItems,
  selectedItems,
  onSelectionChange,
  isSingleSelection = false,
}: CreatableSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleAddItem = (item: Item) => {
    if (selectedItems.some((i) => i.name.toLowerCase() === item.name.toLowerCase())) {
      setInputValue('');
      return;
    }

    if (isSingleSelection) {
      onSelectionChange([item]);
    } else {
      onSelectionChange([...selectedItems, item]);
    }
    setInputValue('');
  };

  const handleTextInput = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const existingItem = allAvailableItems.find(
      (i) => i.name.toLowerCase() === trimmedInput.toLowerCase()
    );

    const newItem: Item = existingItem
      ? { id: existingItem.id, name: existingItem.name }
      : { id: null, name: trimmedInput };

    handleAddItem(newItem);
  };

  const handleRemoveItem = (itemToRemove: Item) => {
    onSelectionChange(
      selectedItems.filter((item) => item.name !== itemToRemove.name)
    );
  };

  const unselectedItems = allAvailableItems.filter(
    (item) =>
      !selectedItems.some(
        (selected) => selected.name.toLowerCase() === item.name.toLowerCase()
      )
  );

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold uppercase tracking-wide text-black mb-2">
        {label}
      </Text>

      {/* Selected Items */}
      <View className="flex-row flex-wrap mb-2 -m-1">
        {selectedItems.map((item, index) => (
          <View
            key={index}
            className="m-1 flex-row items-center rounded-full bg-black px-3 py-1.5"
          >
            <Text className="text-xs font-semibold uppercase tracking-wide text-white">
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveItem(item)}
              className="ml-2"
            >
              <Ionicons name="close-circle" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Input */}
      {(!isSingleSelection || selectedItems.length === 0) && (
        <View className="flex-row items-center">
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleTextInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-black"
          />
          <TouchableOpacity
            onPress={handleTextInput}
            className="ml-2 rounded-lg bg-black p-3"
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Suggestions */}
      {isFocused && inputValue.length > 0 && unselectedItems.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
        >
          {unselectedItems
            .filter((i) =>
              i.name.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleAddItem(item)}
                className="m-1 rounded-full border border-gray-300 bg-gray-100 px-3 py-1.5"
              >
                <Text className="text-xs font-medium text-black/70">
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}
    </View>
  );
}
