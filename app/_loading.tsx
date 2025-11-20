import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { useEffect } from 'react';
import { Easing } from 'react-native-reanimated';

export default function LoadingScreen({
  isAppReady,
  onExitAnimationFinish
}: {
  isAppReady: boolean;
  onExitAnimationFinish: () => void;
}) {

  useEffect(() => {
    if (isAppReady) {
      // Aguarda a animação de saída completar
      setTimeout(() => {
        onExitAnimationFinish();
      }, 800);
    }
  }, [isAppReady, onExitAnimationFinish]);

  return (
    <MotiView
      from={{ opacity: 1 }}
      animate={{ opacity: isAppReady ? 0 : 1 }}
      transition={{
        type: 'timing',
        duration: 600,
        easing: Easing.out(Easing.ease),
      }}
      className="flex-1 justify-center items-center bg-white"
    >
      {/* Nome do app - TSUKIYAMI em kanji e romaji */}
      <MotiView
        from={{
          opacity: 0,
          translateY: 20
        }}
        animate={{
          opacity: isAppReady ? 0 : 1,
          translateY: isAppReady ? -30 : 0
        }}
        transition={{
          opacity: {
            type: 'timing',
            duration: 800,
            delay: 400,
            easing: Easing.out(Easing.ease),
          },
          translateY: {
            type: 'spring',
            damping: 15,
            delay: 400,
          }
        }}
        className="mt-12 items-center"
      >
        {/* Kanji 月闇 (Tsukiyami - Lua + Escuridão) */}
        <Text className="text-5xl font-light text-black tracking-wider mb-2">
          月闇
        </Text>

        {/* Nome em romaji */}
        <Text className="text-xl font-bold text-black tracking-widest">
          TSUKIYAMI
        </Text>
      </MotiView>

      {/* Subtítulo/Tagline */}
      <MotiView
        from={{
          opacity: 0,
          translateY: 10
        }}
        animate={{
          opacity: isAppReady ? 0 : 1,
          translateY: isAppReady ? -20 : 0
        }}
        transition={{
          opacity: {
            type: 'timing',
            duration: 800,
            delay: 600,
            easing: Easing.out(Easing.ease),
          },
          translateY: {
            type: 'spring',
            damping: 15,
            delay: 600,
          }
        }}
        className="mt-3"
      >
        <Text className="text-sm text-black/60 tracking-widest uppercase">
          Share Your Passion
        </Text>
      </MotiView>

      {/* Indicador de loading (3 pontos) */}
      <View className="flex-row mt-16 space-x-2">
        {[0, 1, 2].map((index) => (
          <MotiView
            key={index}
            from={{ opacity: 0.3, scale: 1 }}
            animate={{
              opacity: isAppReady ? 0 : [0.3, 1, 0.3],
              scale: isAppReady ? 0 : [1, 1.2, 1]
            }}
            transition={{
              type: 'timing',
              duration: 1500,
              loop: !isAppReady,
              delay: index * 200,
              easing: Easing.inOut(Easing.ease),
            }}
            className="w-2 h-2 bg-black rounded-full"
          />
        ))}
      </View>
    </MotiView>
  );
}