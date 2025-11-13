/**
 * Layout Constants - Shared screen layout styles
 *
 * Centraliza los valores que se repiten en 4+ pantallas:
 * - HomeScreen
 * - UserProfileScreen
 * - RewardsScreen
 * - MapScreen (parcialmente)
 *
 * ANTES: Cada pantalla definía su propio contentContainerStyle
 * AHORA: Usar constantes compartidas SCREEN_CONTENT_STYLE, SCREEN_PADDING_BOTTOM, etc.
 */

import { ViewStyle } from 'react-native';

/**
 * SCREEN_PADDING_BOTTOM
 * Espacio inferior uniforme en todas las pantallas
 * Deja espacio para el tab bar + safe area
 *
 * Valor: 140px
 * Usado en: homeScreen, RoutinesScreen, MapScreen, ProgressScreen, UserProfileScreen, RewardsScreen
 *
 * NOTA: HomeScreen originalmente usaba cálculo dinámico:
 * paddingBottom: tabBarHeight + bottom + 8 (~91px)
 * Pero se estandariza a 140 para consistencia visual
 */
export const SCREEN_PADDING_BOTTOM = 140;

/**
 * SCREEN_PADDING_TOP
 * Espacio superior estándar en pantallas
 * Separa el contenido del top safe area
 *
 * Valor: 32px (AJUSTADO DESPUÉS DE TESTING)
 *
 * INVESTIGACIÓN:
 * - HomeScreen originalmente: paddingTop: 4px (inconsistente)
 * - RoutinesScreen: paddingTop: 16px (RoutinesLayout) + 16px (RoutinesHeader container) = 32px visual
 * - Para consistencia: Estandarizar a 32px en todas las pantallas
 */
export const SCREEN_PADDING_TOP = 32;

/**
 * SCREEN_PADDING_HORIZONTAL
 * Espacio horizontal en todos los lados
 * Consistente en TODAS las pantallas
 *
 * Valor: 16px
 */
export const SCREEN_PADDING_HORIZONTAL = 16;

/**
 * SCREEN_GAP
 * Espaciado vertical entre secciones principales
 * Usado en ScrollView contentContainerStyle con rowGap/gap
 *
 * Valor: 24px
 * NOTA: MapScreen, Routines, Progress usan 16px (33% menos) - INCONSISTENTE
 * Deberíamos estandarizar a 24px
 */
export const SCREEN_GAP = 24;

/**
 * SCREEN_CONTENT_STYLE
 * Composición completa para ScrollView contentContainerStyle
 *
 * Usado en:
 * - HomeScreen
 * - UserProfileScreen
 * - RewardsScreen
 *
 * @example
 * <SurfaceScreen
 *   scroll
 *   contentContainerStyle={SCREEN_CONTENT_STYLE}
 * >
 */
export const SCREEN_CONTENT_STYLE: ViewStyle = {
  paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
  paddingTop: SCREEN_PADDING_TOP,
  paddingBottom: SCREEN_PADDING_BOTTOM,
  gap: SCREEN_GAP,
};

/**
 * SCREEN_SCROLL_STYLE
 * StyleSheet para ScrollView (cuando usas StyleSheet.create)
 *
 * Alternativa a SCREEN_CONTENT_STYLE cuando usas StyleSheet
 *
 * @example
 * const styles = StyleSheet.create({
 *   scrollContent: SCREEN_SCROLL_STYLE
 * });
 */
export const SCREEN_SCROLL_STYLE: ViewStyle = {
  paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
  paddingTop: SCREEN_PADDING_TOP,
  paddingBottom: SCREEN_PADDING_BOTTOM,
};

/**
 * MAP_SCREEN_CONTENT_STYLE
 * Estilo específico para MapScreen
 *
 * MapScreen maneja el paddingHorizontal en GymScreenHeader y body,
 * así que solo necesitamos paddingTop y paddingBottom aquí
 *
 * Usado en:
 * - MapScreen (SurfaceScreen contentContainerStyle)
 *
 * @example
 * <SurfaceScreen
 *   contentContainerStyle={MAP_SCREEN_CONTENT_STYLE}
 * >
 */
export const MAP_SCREEN_CONTENT_STYLE: ViewStyle = {
  paddingTop: SCREEN_PADDING_TOP,
  paddingBottom: SCREEN_PADDING_BOTTOM,
  gap: SCREEN_GAP,
};

/**
 * Layout presets para diferentes tipos de pantallas
 */
export const layouts = {
  // Pantallas con scroll simple (Home, UserProfile, Rewards)
  scrollScreen: SCREEN_CONTENT_STYLE,

  // Pantallas con FlatList (Routines, Progress)
  listScreen: {
    paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
    paddingTop: SCREEN_PADDING_TOP,
    paddingBottom: SCREEN_PADDING_BOTTOM,
  },

  // Header spacing (gap entre título y contenido)
  header: {
    marginBottom: 24,
  },

  // Sección spacing
  section: {
    marginBottom: 24,
  },

  // Component spacing
  component: {
    marginBottom: 12,
  },
} as const;

/**
 * Border radius presets
 * Para consistencia visual
 */
export const borderRadius = {
  // Botones y pills pequeños
  small: 8,
  // Cards normales y componentes
  medium: 12,
  // Cards grandes y headers
  large: 16,
  // Cards premium / decorativos
  xlarge: 20,
  // Border radius máximo
  full: 9999,
} as const;

/**
 * Spacing scale helpers
 * Para usar en StyleSheet o inline styles
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
} as const;

/**
 * Shadow elevations
 * Para Card y componentes elevated
 */
export const elevations = {
  // Sin sombra
  none: {
    shadowColor: 'transparent',
    elevation: 0,
  },
  // Sombra sutil
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  // Sombra normal
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  // Sombra pronunciada
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
} as const;