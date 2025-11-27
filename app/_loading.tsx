import { View, Text, Animated } from 'react-native';
import { useEffect, useState, useRef } from 'react';

export default function LoadingScreen({
  isAppReady,
  onExitAnimationFinish
}: {
  isAppReady: boolean;
  onExitAnimationFinish: () => void;
}) {
  const [timeElapsed, setTimeElapsed] = useState(false);
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const kanjiScale = useRef(new Animated.Value(0.8)).current;
  const romajiOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Timer mínimo de 5 segundos
    const timer = setTimeout(() => {
      setTimeElapsed(true);
    }, 5000);

    // Sequência de entrada
    Animated.sequence([
      // Kanji aparece
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.spring(kanjiScale, {
          toValue: 1,
          delay: 300,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Romaji aparece
      Animated.timing(romajiOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      // Tagline aparece
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação dos pontos (loop)
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(dot1Opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    const dotsTimer = setTimeout(animateDots, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(dotsTimer);
    };
  }, []);

  const startExit = isAppReady && timeElapsed;

  useEffect(() => {
    if (startExit) {
      // Animação de saída
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        onExitAnimationFinish();
      });
    }
  }, [startExit, onExitAnimationFinish]);

  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        opacity: screenOpacity,
      }}
    >
      {/* Kanji 月闇 */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: kanjiScale }],
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 72,
            fontWeight: '300',
            color: '#1a1a1a',
            letterSpacing: 8,
          }}
        >
          月闇
        </Text>
      </Animated.View>

      {/* Nome em romaji */}
      <Animated.View
        style={{
          opacity: romajiOpacity,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: 6,
          }}
        >
          TSUKIYAMI
        </Text>
      </Animated.View>

      {/* Linha decorativa */}
      <Animated.View
        style={{
          width: 80,
          height: 1,
          backgroundColor: '#666666',
          marginBottom: 16,
          opacity: taglineOpacity,
        }}
      />

      {/* Tagline */}
      <Animated.View
        style={{
          opacity: taglineOpacity,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '400',
            color: '#666666',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          Share Your Passion
        </Text>
      </Animated.View>

      {/* Indicador de loading (3 pontos) */}
      <View
        style={{
          flexDirection: 'row',
          marginTop: 48,
          gap: 8,
        }}
      >
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#1a1a1a',
            opacity: dot1Opacity,
          }}
        />
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#1a1a1a',
            opacity: dot2Opacity,
          }}
        />
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#1a1a1a',
            opacity: dot3Opacity,
          }}
        />
      </View>
    </Animated.View>
  );
}