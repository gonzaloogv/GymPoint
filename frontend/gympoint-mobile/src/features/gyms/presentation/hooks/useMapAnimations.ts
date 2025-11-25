import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export function useMapAnimations() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 900, // USER_PIN_PULSE_DURATION
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 900, // USER_PIN_PULSE_DURATION
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [scale]);

  return { scale };
}
