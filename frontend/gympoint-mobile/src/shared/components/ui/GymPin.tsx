import React from 'react';
import { Platform, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';

type GymPinProps = {
  size?: number;
  scale?: number;
};

// ViewBox base y punto de ancla (punta del pin)
const VIEWBOX_WIDTH = 120;
const VIEWBOX_HEIGHT = 180;
const PIN_TIP_Y = 170;

// Ancla usado por MapMarker para alinear la punta con la coordenada
export const GYM_PIN_ANCHOR_Y = PIN_TIP_Y / VIEWBOX_HEIGHT;

// Padding externo para evitar recorte en Android
const ANDROID_EXTRA_PADDING = 8;
const IOS_EXTRA_PADDING = 4;

// Escala máxima esperada; el canvas se dimensiona a este máximo para evitar clipping al hacer zoom
const MAX_SCALE = 3;

/**
 * Pin simple y robusto para Google Maps.
 * Sin animaciones y con canvas sobredimensionado para que el bitmap no se corte al escalar.
 */
export function GymPin({ size = 48, scale = 1.0 }: GymPinProps) {
  const clampedScale = Math.max(0.1, Math.min(scale, MAX_SCALE));
  const baseSize = Math.max(1, Math.round(size));
  const svgMaxSize = Math.round(baseSize * MAX_SCALE);
  const renderScale = clampedScale / MAX_SCALE;

  const basePadding = Platform.OS === 'android' ? ANDROID_EXTRA_PADDING : IOS_EXTRA_PADDING;
  // Padding crece suavemente con la escala para evitar recorte en Android.
  const padding = Math.round(basePadding * (1 + 0.6 * Math.max(0, clampedScale - 1)));

  const canvasSize = svgMaxSize + padding * 2;

  return (
    <View
      renderToHardwareTextureAndroid
      collapsable={false}
      style={{
        width: canvasSize,
        height: canvasSize,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        padding,
      }}
    >
      <Svg
        width={svgMaxSize}
        height={svgMaxSize}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          overflow: 'visible',
          transform: [{ scale: renderScale }],
        }}
      >
        {/* Caja invisible para asegurar el bounding completo */}
        <Rect x={0} y={0} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="transparent" />

        {/* Sombra sutil */}
        <Ellipse cx={60} cy={PIN_TIP_Y - 2} rx={18} ry={6} fill="#000" opacity={0.12} />

        {/* Pin base */}
        <Path
          d="M60 10 C33 10 12 31 12 58 C12 108 60 170 60 170 C60 170 108 108 108 58 C108 31 87 10 60 10 Z"
          fill="#43adff"
          stroke="#25638d"
          strokeWidth={4}
          strokeLinejoin="round"
        />

        {/* Brillo lateral */}
        <Path
          d="M40 20 C28 32 22 46 22 62 C22 98 46 138 60 158"
          fill="none"
          stroke="#d8edff"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.7}
        />

        {/* Centro */}
        <Circle cx={60} cy={62} r={18} fill="#ECF0F1" />
        <Circle cx={60} cy={62} r={12} fill="#43adff" opacity={0.9} />

        {/* Barra / mancuerna simple */}
        <Rect x={36} y={102} width={48} height={12} rx={6} fill="#25638d" />
        <Rect x={44} y={94} width={32} height={10} rx={5} fill="#43adff" />
        <Rect x={30} y={98} width={8} height={20} rx={3} fill="#25638d" />
        <Rect x={82} y={98} width={8} height={20} rx={3} fill="#25638d" />
      </Svg>
    </View>
  );
}
