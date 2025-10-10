// src/shared/components/ui/Screen.tsx
import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import { sp } from '@shared/styles';

/** Fondo global fuera del SafeArea (evita “gris” al rebotar) */
const Bg = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme?.colors?.bg ?? '#fff'};
`;

/** SafeArea solo para TOP/L/R; el bottom lo maneja cada pantalla con padding */
const Safe = styled(SafeAreaView).attrs({ edges: ['top', 'left', 'right'] })`
  flex: 1;
`;

type ScreenProps = {
  children: React.ReactNode;
  /** Activa ScrollView si es true */
  scroll?: boolean;
  /** Estilo del contenedor (ScrollView o Root) */
  style?: StyleProp<ViewStyle>;
  /** Estilo del contenido interno del ScrollView */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Mostrar u ocultar indicador de scroll vertical */
  showsVerticalScrollIndicator?: boolean;
  /** Cómo manejar el teclado con taps dentro del scroll */
  keyboardShouldPersistTaps?: 'always' | 'handled' | 'never';
  /** iOS: desactiva el “rebote” (rubber band) si true */
  noBounce?: boolean;
  /** iOS/Android: desactiva el “rebote” vertical si true */
  padBottom?: number | 'safe';
};

/** Componente Screen: Fondo + SafeArea + (opcional) ScrollView */
export function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
  noBounce = false,
  padBottom,
}: ScreenProps) {
  const theme = useTheme();

  if (scroll) {
    return (
      <Bg>
        <Safe>
          <ScrollView
            // Aseguramos el mismo fondo también en el ScrollView
            style={[{ backgroundColor: theme?.colors?.bg ?? '#fff' }, style] as any}
            contentContainerStyle={contentContainerStyle as any}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            // Opcional: suaviza el teclado al arrastrar
            keyboardDismissMode="on-drag"
            // Control del rebote en iOS y overscroll en Android
            bounces={!noBounce}
            alwaysBounceVertical={!noBounce}
            overScrollMode={noBounce ? 'never' : 'auto'}
            // Evita ajustes automáticos del sistema que alteren el padding
            contentInsetAdjustmentBehavior="never"
          >
            {children}
          </ScrollView>
        </Safe>
      </Bg>
    );
  }

  return (
    <Bg>
      <Safe>
        <View style={[{ flex: 1 }, style] as any}>{children}</View>
      </Safe>
    </Bg>
  );
}

/* ---------- Primitivas de layout reutilizables ---------- */

/** Contenedor de página con padding y gap vertical */
export const Container = styled(SafeAreaView)`
  flex: 1;
  padding: ${({ theme }) => sp(theme, 0.8)}px;
  gap: ${({ theme }) => sp(theme, 1)}px; /* RN 0.71+ soporta gap */
`;

/** Centrado absoluto típico para forms/login */
export const CenteredContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 0 20px; /* margen horizontal para inputs */
`;

/** Header centrado (ej: logo/título) */
export const HeaderContainer = styled(View)`
  padding: ${({ theme }) => sp(theme, 2)}px;
  align-items: center;
  justify-content: center;
`;

/** Wrapper para la search bar con padding horizontal */
export const SearchBarContainer = styled(View)`
  padding: 0 ${({ theme }) => sp(theme, 2)}px;
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const Title = styled(Text)`
  font-weight: 700;
  font-size: 16px;
`;
const Ghost = styled(TouchableOpacity)``;
const GhostTxt = styled(Text)`
  color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
  font-weight: 600;
`;

type Props = {
  title: string;
  onSeeAll?: () => void;
  rightText?: string; // default "Ver todos"
  style?: any;
};

export function SectionHeader({
  title,
  onSeeAll,
  rightText = 'Ver todos',
  style,
}: Props) {
  return (
    <Row style={style}>
      <Title>{title}</Title>
      {onSeeAll && (
        <Ghost onPress={onSeeAll}>
          <GhostTxt>{rightText}</GhostTxt>
        </Ghost>
      )}
    </Row>
  );
}
