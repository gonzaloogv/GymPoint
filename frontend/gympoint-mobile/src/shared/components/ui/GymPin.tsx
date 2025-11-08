import React, { useEffect } from 'react';
import Svg, { G, Path, Circle, Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface GymPinProps {
  size?: number;
}

const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * GymPin - Pin personalizado para marcar gimnasios en el mapa
 * Incluye mancuerna y pin de ubicación con animación de bob (arriba/abajo)
 */
export function GymPin({ size = 48 }: GymPinProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Animación de bob: -6 → 6 → -6 en 1.6s, loop infinito
    translateY.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(-6, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 502.691 502.691">
      {/* PIN DE UBICACIÓN (DETRÁS, ARRIBA, ANIMADO) */}
      <AnimatedG animatedProps={animatedProps}>
        <G transform="translate(251.345 155) scale(8.875) translate(-16 -16)">
          <Path
            d="M21 12C21 9.24 18.76 7 16 7C13.24 7 11 9.24 11 12C11 14.76 13.24 17 16 17C18.76 17 21 14.76 21 12ZM16 1C22.08 1 27 5.92 27 12C27 21 16 31 16 31C16 31 5 21 5 12C5 5.92 9.92 1 16 1Z"
            fill="#ECF0F1"
          />
          <Path
            d="M19 28C23 24 27 17.447 27 12C27 5.925 22.075 1 16 1C9.925 1 5 5.925 5 12C5 21 16 31 16 31 M21 12C21 9.238 18.762 7 16 7C13.238 7 11 9.238 11 12C11 14.762 13.238 17 16 17C18.762 17 21 14.762 21 12Z"
            stroke="#43adff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>
      </AnimatedG>

      {/* MANCUERNA (ADELANTE, ABAJO) */}
      <G transform="translate(41 162) scale(0.837)">
        <Path
          fill="#43adff"
          d="M27.927,325.818C12.567,325.818,0,313.251,0,297.891V204.8c0-15.36,12.567-27.927,27.927-27.927c15.36,0,27.927,12.567,27.927,27.927v93.091C55.855,313.251,43.287,325.818,27.927,325.818z"
        />
        <Path
          fill="#25638d"
          d="M74.473,353.745c-15.36,0-27.927-12.567-27.927-27.927V176.873c0-15.36,12.567-27.927,27.927-27.927s27.927,12.567,27.927,27.927v148.945C102.4,341.178,89.833,353.745,74.473,353.745z"
        />
        <Path
          fill="#43adff"
          d="M474.764,176.873c15.36,0,27.927,12.567,27.927,27.927v93.091c0,15.36-12.567,27.927-27.927,27.927c-15.36,0-27.927-12.567-27.927-27.927V204.8C446.836,189.44,459.404,176.873,474.764,176.873z"
        />
        <Path
          fill="#25638d"
          d="M428.208,148.945c15.36,0,27.927,12.567,27.927,27.927v148.945c0,15.36-12.567,27.927-27.927,27.927s-27.927-12.567-27.927-27.927V176.873C400.281,161.513,412.848,148.945,428.208,148.945z"
        />
        <Polygon fill="#BDC3C7" points="148.942,297.895 353.742,297.895 353.742,204.804 148.942,204.804" />
        <Path
          fill="#43adff"
          d="M121.018,381.673c-15.36,0-27.927-12.567-27.927-27.927v-204.8c0-15.36,12.567-27.927,27.927-27.927s27.927,12.567,27.927,27.927v204.8C148.945,369.105,136.378,381.673,121.018,381.673z"
        />
        <Path
          fill="#43adff"
          d="M381.673,121.018c15.36,0,27.927,12.567,27.927,27.927v204.8c0,15.36-12.567,27.927-27.927,27.927c-15.36,0-27.927-12.567-27.927-27.927v-204.8C353.745,133.585,366.313,121.018,381.673,121.018z"
        />
        <G fill="#ECF0F1">
          <Circle cx="214.109" cy="214.109" r="9.309" />
          <Circle cx="251.345" cy="214.109" r="9.309" />
          <Circle cx="288.582" cy="214.109" r="9.309" />
          <Circle cx="232.727" cy="232.727" r="9.309" />
          <Circle cx="269.964" cy="232.727" r="9.309" />
          <Circle cx="214.109" cy="251.345" r="9.309" />
          <Circle cx="251.345" cy="251.345" r="9.309" />
          <Circle cx="288.582" cy="251.345" r="9.309" />
          <Circle cx="214.109" cy="288.582" r="9.309" />
          <Circle cx="251.345" cy="288.582" r="9.309" />
          <Circle cx="288.582" cy="288.582" r="9.309" />
          <Circle cx="232.727" cy="269.964" r="9.309" />
          <Circle cx="269.964" cy="269.964" r="9.309" />
        </G>
      </G>
    </Svg>
  );
}
