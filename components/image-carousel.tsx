import React, { useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageCarouselProps {
  images: string[];
  onRemoveImage: (uri: string) => void;
  imageSize?: number; // Tamanho das thumbnails (padrão: 100)
  spacing?: number; // Espaçamento entre imagens (padrão: 12)
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onRemoveImage,
  imageSize = 100,
  spacing = 12,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleRemoveImage = (uri: string) => {
    setRemovingImage(uri);
    
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
        tension: 100,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
      }),
    ]).start(() => {
      onRemoveImage(uri);
      setRemovingImage(null);
      scaleAnim.setValue(1);
    });
  };

  const openImageViewer = (uri: string) => {
    setSelectedImage(uri);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  if (images.length === 0) return null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="my-2"
        contentContainerStyle={{ paddingHorizontal: 4 }}
        decelerationRate="fast"
        snapToInterval={imageSize + spacing}
      >
        {images.map((uri, index) => {
          const isRemoving = removingImage === uri;
          
          return (
            <Animated.View
              key={`${uri}-${index}`}
              className="relative"
              style={{
                marginRight: spacing,
                transform: isRemoving ? [{ scale: scaleAnim }] : undefined,
              }}
            >
              {/* Imagem clicável */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openImageViewer(uri)}
                className="relative"
              >
                <Image
                  source={{ uri }}
                  className="rounded-2xl bg-gray-200"
                  style={{ width: imageSize, height: imageSize }}
                  resizeMode="cover"
                />
                
                {/* Overlay sutil ao pressionar */}
                <View className="absolute inset-0 rounded-2xl bg-black opacity-0 active:opacity-10" />
              </TouchableOpacity>

              {/* Botão de remover */}
              <TouchableOpacity
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg active:bg-red-600"
                onPress={() => handleRemoveImage(uri)}
                activeOpacity={0.8}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>

              {/* Indicador de posição */}
              {images.length > 1 && (
                <View className="absolute bottom-2 left-2 bg-black/60 rounded-full px-2 py-0.5">
                  <Ionicons name="images" size={12} color="white" />
                </View>
              )}
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Contador de imagens */}
      {images.length > 0 && (
        <View className="flex-row items-center mt-1 px-1">
          <Ionicons name="images-outline" size={14} color="#9CA3AF" />
          <View className="ml-1.5 px-2 py-0.5 bg-gray-100 rounded-full">
            <Ionicons name="camera" size={12} color="#6B7280" />
          </View>
        </View>
      )}

      {/* Modal para visualizar imagem em tela cheia */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={closeImageViewer}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black">
          <TouchableWithoutFeedback onPress={closeImageViewer}>
            <View className="flex-1 justify-center items-center">
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT,
                  }}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableWithoutFeedback>

          {/* Botão de fechar */}
          <TouchableOpacity
            className="absolute top-12 right-4 bg-white/20 backdrop-blur rounded-full p-3 active:bg-white/30"
            onPress={closeImageViewer}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          {/* Botão de remover (no visualizador) */}
          <TouchableOpacity
            className="absolute bottom-12 self-center bg-red-500 rounded-full px-6 py-3 flex-row items-center active:bg-red-600"
            onPress={() => {
              if (selectedImage) {
                handleRemoveImage(selectedImage);
                closeImageViewer();
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
            <View className="ml-2 text-white font-semibold">
              <Ionicons name="remove-circle" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default ImageCarousel;