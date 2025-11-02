import { useTheme } from '@shared/hooks';
import React, { useMemo } from 'react';
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleProp, // Importa StyleProp
  ViewStyle,
  StyleSheet  // Importa ViewStyle
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;

  /**
   * @deprecated Use safeAreaTop and safeAreaBottom instead for granular control
   * Controls both top and bottom safe area (legacy behavior)
   */
  padBottom?: 'safe' | 'none';

  /**
   * Controls whether to apply safe area insets at the TOP of the screen
   * Prevents content from overlapping with status bar, notch, or dynamic island
   * @default true - Most screens need top safe area protection
   */
  safeAreaTop?: boolean;

  /**
   * Controls whether to apply safe area insets at the BOTTOM of the screen
   * Prevents content from overlapping with home indicator or bottom notch
   * @default false - Most screens are inside Tab Navigator which already has safe area
   */
  safeAreaBottom?: boolean;

  /**
   * Custom background color className to override default theme colors
   * Example: 'bg-gray-900' or 'bg-white'
   */
  backgroundColor?: string;

  // Acepta StyleProp<ViewStyle> para un mejor tipado
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  safeAreaTop,
  safeAreaBottom,
  backgroundColor,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  padBottom, // (Lo mantengo por tu lógica de edges)
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- CAMBIO 1: Define AMBOS colores ---
  // El color de la app (el gris de fondo de tus pantallas)
  const defaultAppBgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const appBgColor = backgroundColor || defaultAppBgColor;
  // El color raíz (el negro que se ve en el rebote y en el safe area)
  const rootBgColor = backgroundColor || (isDark ? 'bg-gray-900' : 'bg-white');

  // --- Tu lógica de `edges` está perfecta, no se toca ---
  const edges: Edge[] = useMemo(() => {
    if (padBottom === 'safe') {
      return ['top', 'bottom'];
    }
    const computedEdges: Edge[] = [];
    if (safeAreaTop !== false) {
      computedEdges.push('top');
    }
    if (safeAreaBottom === true) {
      computedEdges.push('bottom');
    }
    return computedEdges;
  }, [padBottom, safeAreaTop, safeAreaBottom]);

  // --- CAMBIO 2: `contentContainerStyle` inteligente ---
  const finalContentContainerStyle = useMemo(() => {
    // Aseguramos que sea un objeto para poder mutarlo
    const baseStyle = { ...StyleSheet.flatten(contentContainerStyle) };

    // Solo aplicamos esto si es un ScrollView
    if (scroll) {
      // Para que el fondo se pinte si el contenido es más corto
      baseStyle.flexGrow = 1;

      // Si NO estamos protegiendo el bottom (o sea, el Tab Bar está visible)
    
    }
    return baseStyle;
  }, [scroll, safeAreaBottom, contentContainerStyle]);

  const Container = scroll ? ScrollView : View;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // --- CAMBIO 3: El color RAÍZ (negro) va en el wrapper ---
      className={`flex-1 ${rootBgColor}`}
    >
      {/* El SafeAreaView es transparente, solo maneja insets */}
      <SafeAreaView edges={edges} className="flex-1">
        <Container
          // --- CAMBIO 4: El color de la APP (gris) va en el Container ---
          className={`flex-1 ${appBgColor}`}
          
          contentContainerStyle={finalContentContainerStyle} // Usa el style inteligente
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </Container>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};