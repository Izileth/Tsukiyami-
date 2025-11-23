import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  FlatList,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageCarouselProps {
  images: string[];
  onRemoveImage: (uri: string) => void;
  maxImages?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onRemoveImage,
  maxImages = 10,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [removingImage, setRemovingImage] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  // Tamanho dinâmico baseado na quantidade de imagens
  const getImageSize = () => {
    if (images.length === 1) return SCREEN_WIDTH - 48;
    if (images.length === 2) return (SCREEN_WIDTH - 64) / 2;
    return (SCREEN_WIDTH - 72) / 3;
  };

  const imageSize = getImageSize();

  const handleRemoveImage = (uri: string) => {
    setRemovingImage(uri);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemoveImage(uri);
      setRemovingImage(null);
      scaleAnim.setValue(1);
    });
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    Animated.spring(modalFadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeImageViewer = () => {
    Animated.timing(modalFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedImageIndex(null);
    });
  };

  const navigateImage = (direction: 'next' | 'prev') => {
    if (selectedImageIndex === null) return;
    
    if (direction === 'next' && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    } else if (direction === 'prev' && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  if (images.length === 0) return null;

  const renderImageItem = ({ item: uri, index }: { item: string; index: number }) => {
    const isRemoving = removingImage === uri;
    const isPressed = pressedIndex === index;
    
    return (
      <Animated.View
        style={{
          width: imageSize,
          height: imageSize,
          marginRight: images.length <= 2 ? 16 : 0,
          transform: isRemoving ? [{ scale: scaleAnim }] : [{ scale: 1 }],
          opacity: isRemoving ? 0 : 1,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => setPressedIndex(index)}
          onPressOut={() => setPressedIndex(null)}
          onPress={() => openImageViewer(index)}
          className="w-full h-full"
          style={{
            transform: isPressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
          }}
        >
          {/* Borda fina e elegante */}
          <View className="w-full h-full rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            <Image
              source={{ uri }}
              className="w-full h-full"
              resizeMode="cover"
            />
            
            {/* Overlay de gradiente sutil */}
            <View className="absolute top-0 left-0 right-0 h-[30%] bg-black/[0.03]" />
            
            {/* Número minimalista */}
            {images.length > 1 && (
              <View className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/95 border border-gray-200 justify-center items-center">
                <Text className="text-[11px] font-semibold text-black tracking-wider">
                  {index + 1}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Botão de remover minimalista */}
        <TouchableOpacity
          className="absolute -top-1.5 -right-1.5 p-1"
          onPress={() => handleRemoveImage(uri)}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View className="w-6 h-6 rounded-full bg-white border-[1.5px] border-black justify-center items-center">
            <Ionicons name="close" size={14} color="#000" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      {/* Grid/Lista de Imagens */}
      <View className="py-4">
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal={images.length <= 2}
          numColumns={images.length > 2 ? 3 : undefined}
          key={images.length > 2 ? 'grid' : 'horizontal'}
          showsHorizontalScrollIndicator={false}
          columnWrapperStyle={images.length > 2 ? { justifyContent: 'space-between', marginBottom: 16 } : undefined}
          scrollEnabled={images.length > 2}
        />

        {/* Contador minimalista */}
        <View className="mt-4 px-6">
          <View className="h-[1px] bg-gray-200 mb-3" />
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px] font-semibold text-black tracking-[1.2px]">
              {images.length} · {images.length === 1 ? 'FOTO' : 'FOTOS'}
            </Text>
            {images.length >= maxImages && (
              <View className="px-2 py-1 bg-black rounded">
                <Text className="text-[9px] font-bold text-white tracking-wider">
                  MÁXIMO
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Modal de Visualização Minimalista */}
      <Modal
        visible={selectedImageIndex !== null}
        transparent
        animationType="none"
        onRequestClose={closeImageViewer}
        statusBarTranslucent
      >
        <Animated.View 
          className="flex-1 bg-black"
          style={{ opacity: modalFadeAnim }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeImageViewer}
            className="flex-1 justify-center items-center"
          >
            {selectedImageIndex !== null && (
              <Image
                source={{ uri: images[selectedImageIndex] }}
                style={{
                  width: SCREEN_WIDTH,
                  height: SCREEN_HEIGHT,
                }}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>

          {/* Header minimalista */}
          <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-6 pt-[60px] pb-5">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 justify-center items-center"
              onPress={closeImageViewer}
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            {images.length > 1 && selectedImageIndex !== null && (
              <View className="px-4 py-2 bg-white/10 border border-white/20 rounded-full">
                <Text className="text-[13px] font-semibold text-white tracking-wider">
                  {selectedImageIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>

          {/* Navegação minimalista */}
          {images.length > 1 && selectedImageIndex !== null && (
            <>
              {selectedImageIndex > 0 && (
                <TouchableOpacity
                  className="absolute left-6 top-1/2 -mt-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 justify-center items-center"
                  onPress={() => navigateImage('prev')}
                  activeOpacity={0.6}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
              )}
              
              {selectedImageIndex < images.length - 1 && (
                <TouchableOpacity
                  className="absolute right-6 top-1/2 -mt-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 justify-center items-center"
                  onPress={() => navigateImage('next')}
                  activeOpacity={0.6}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Ionicons name="chevron-forward" size={28} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Botão de remover minimalista */}
          <View className="absolute bottom-0 left-0 right-0 pb-[50px] px-6 items-center">
            <TouchableOpacity
              className="flex-row items-center gap-2.5 bg-white/10 border border-white/20 px-6 py-3.5 rounded-3xl"
              onPress={() => {
                if (selectedImageIndex !== null) {
                  const uriToRemove = images[selectedImageIndex];
                  handleRemoveImage(uriToRemove);
                  closeImageViewer();
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text className="text-[13px] font-bold text-white tracking-[1.2px]">
                REMOVER
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

export default ImageCarousel;