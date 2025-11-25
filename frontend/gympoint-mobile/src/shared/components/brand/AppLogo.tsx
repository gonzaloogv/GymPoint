import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G, Circle, Rect, Defs, Filter, FeOffset, FeFlood, FeComposite, FeMerge, FeMergeNode } from 'react-native-svg';
import { useTheme } from '@shared/hooks';

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 80 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Color del borde - celestito en light, moradito en dark
  const borderColor = isDark ? 'rgba(167, 139, 250, 0.5)' : 'rgba(59, 130, 246, 0.5)';
  const bgColor = isDark ? '#312e81' : '#dbeafe';

  // Sombra siguiendo el patrón de ActionCard
  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 16 },
        shadowRadius: 22,
        elevation: 10,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 18,
        elevation: 5,
      };

  // El logo ocupa casi todo el espacio (95% para dejar padding interno)
  const logoSize = size * 0.95;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          borderWidth: 2,
          borderColor: borderColor,
          backgroundColor: bgColor,
          justifyContent: 'center',
          alignItems: 'center',
          padding: size * 0.025, // 2.5% de padding
        },
        shadowStyle,
      ]}
    >
      <Svg width={logoSize} height={logoSize} viewBox="0 0 100 100">
        <Defs>
          {/* SOMBRA MANCUERNA IZQUIERDA */}
          <Filter id="shadow-left" x="-60%" y="-60%" width="220%" height="220%">
            <FeOffset in="SourceAlpha" dx="3" dy="3" result="off" />
            <FeFlood floodColor="#000000" floodOpacity="0.32" result="flood" />
            <FeComposite in="flood" in2="off" operator="in" result="shadow" />
            <FeMerge>
              <FeMergeNode in="shadow" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>

          {/* SOMBRA MANCUERNA DERECHA */}
          <Filter id="shadow-right" x="-60%" y="-60%" width="220%" height="220%">
            <FeOffset in="SourceAlpha" dx="3" dy="3" result="off" />
            <FeFlood floodColor="#000000" floodOpacity="0.32" result="flood" />
            <FeComposite in="flood" in2="off" operator="in" result="shadow" />
            <FeMerge>
              <FeMergeNode in="shadow" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
        </Defs>

        {/* SOMBRA DEL PIN */}
        <G transform="translate(29, 25.25) scale(1.5)" opacity="0.32">
          <Path
            d="M15,0 C7,0 0,7 0,15 C0,28 15,45 15,45 C15,45 30,28 30,15 C30,7 23,0 15,0Z"
            fill="#000000"
          />
          <Circle cx="15" cy="15" r="7" fill="#000000" />
        </G>

        {/* MANCUERNA IZQUIERDA */}
        <G filter="url(#shadow-left)" transform="translate(14.5, 30) scale(1.3)">
          <Rect x="0" y="0" width="8" height="24" rx="2" fill="#ffffff" />
          <Rect x="-7" y="4" width="6" height="16" rx="2" fill="#ffffff" />
        </G>

        {/* MANCUERNA DERECHA */}
        <G filter="url(#shadow-right)" transform="translate(72, 30) scale(1.25)">
          <Rect x="0" y="0" width="8" height="24" rx="2" fill="#ffffff" />
          <Rect x="9" y="4" width="6" height="16" rx="2" fill="#ffffff" />
        </G>

        {/* PIN CENTRAL */}
        <G transform="translate(26, 22.25) scale(1.5)">
          <Path
            d="M15,0 C7,0 0,7 0,15 C0,28 15,45 15,45 C15,45 30,28 30,15 C30,7 23,0 15,0Z"
            fill="#ffffff"
          />
          <Circle cx="15" cy="15" r="7" fill="#2b2b2b" />
        </G>
      </Svg>
    </View>
  );
};
