import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoint?: number; // Altura do bottom sheet (padrão: 50% da tela)
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoint = SCREEN_HEIGHT * 0.8,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

  // PanResponder para arrastar o bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Só ativa o pan se estiver arrastando verticalmente
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // Salva a posição atual ao iniciar o gesto
        translateY.setOffset(lastGestureDy.current);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Só permite arrastar para baixo
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        lastGestureDy.current = Math.max(0, gestureState.dy);

        // Se arrastar mais de 100px ou velocidade > 0.5, fecha
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeSheet();
        } else {
          // Caso contrário, volta para a posição original
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
          lastGestureDy.current = 0;
        }
      },
    })
  ).current;

  const openSheet = useCallback(() => {
  lastGestureDy.current = 0;
  Animated.parallel([
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }),
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
  ]).start();
}, [translateY, backdropOpacity]);

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      lastGestureDy.current = 0;
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      openSheet();
    }
  }, [visible, openSheet, translateY]);
  

  if (!visible) return null;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Backdrop com opacidade animada */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <Animated.View
            className="absolute inset-0 bg-black"
            style={{ opacity: backdropOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.6],
            })}}
          />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
          style={{
            transform: [{ translateY }],
            maxHeight: snapPoint,
          }}
        >
          {/* Handle para arrastar */}
          <View
            className="w-full items-center pt-3 pb-2"
            {...panResponder.panHandlers}
          >
            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </View>

          {/* Botão de fechar */}
          <TouchableOpacity
            className="absolute top-4 right-4 z-10 bg-gray-100 rounded-full p-1.5 active:bg-gray-200"
            onPress={closeSheet}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>

          {/* Conteúdo */}
          <View className="px-6 pb-8 pt-2">
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BottomSheet;