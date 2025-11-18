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
  }, [isAppReady]);

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
      {/* Container do logo/ícone */}
      <View className="relative items-center">
        {/* Círculo de fundo que pulsa */}
        <MotiView
          from={{ scale: 1, opacity: 0.3 }}
          animate={{ 
            scale: isAppReady ? 1.5 : [1, 1.2, 1],
            opacity: isAppReady ? 0 : [0.3, 0.15, 0.3]
          }}
          transition={{
            type: 'timing',
            duration: 2000,
            loop: !isAppReady,
            easing: Easing.inOut(Easing.ease),
          }}
          className="absolute w-48 h-48 bg-black/5 rounded-full"
        />

        {/* Segundo círculo (efeito de onda) */}
        <MotiView
          from={{ scale: 1, opacity: 0.2 }}
          animate={{ 
            scale: isAppReady ? 1.8 : [1, 1.3, 1],
            opacity: isAppReady ? 0 : [0.2, 0.08, 0.2]
          }}
          transition={{
            type: 'timing',
            duration: 2000,
            loop: !isAppReady,
            delay: 300,
            easing: Easing.inOut(Easing.ease),
          }}
          className="absolute w-48 h-48 bg-black/5 rounded-full"
        />

        {/* Kanji 月 (Lua) */}
        <MotiView
          from={{ 
            translateY: 0,
            scale: 0.8,
            opacity: 0,
            rotate: '-10deg'
          }}
          animate={{ 
            translateY: isAppReady ? -100 : 0,
            scale: isAppReady ? 1.2 : 1,
            opacity: isAppReady ? 0 : 1,
            rotate: isAppReady ? '10deg' : '0deg'
          }}
          transition={{
            translateY: {
              type: 'spring',
              damping: 10,
              stiffness: 100,
            },
            scale: {
              type: 'spring',
              damping: 12,
              stiffness: 200,
              delay: 200,
            },
            opacity: {
              type: 'timing',
              duration: 300,
            },
            rotate: {
              type: 'spring',
              damping: 15,
              delay: 100,
            }
          }}
          className="w-32 h-32 bg-black rounded-3xl justify-center items-center shadow-lg"
        >
          <Text className="text-white text-7xl font-light">
            月
          </Text>
        </MotiView>
      </View>

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