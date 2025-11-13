/**
 * Design System Tokens - GymPoint Mobile
 *
 * Sistema centralizado de tokens de diseño.
 * Este es el SINGLE SOURCE OF TRUTH para todos los valores de diseño.
 *
 * Contiene:
 * - Paleta de colores
 * - Sistema de espaciado
 * - Radios de esquinas
 * - Tipografía
 * - Helpers para acceso a valores
 */

// ============================================================================
// COLOR PALETTE - Paleta consolidada de colores
// ============================================================================

export const colorPalette = {
  // Gym colors
  gymPrimary: '#3b82f6',
  gymSecondary: '#4F9CF9',

  // Lifestyle colors
  lifestylePrimary: '#10b981',

  // Premium colors
  premiumPrimary: '#8b5cf6',
  premiumDark: '#9333EA',
  premiumLight: '#7C3AED',
  premiumBg: '#F3E8FF',
  premiumBorder: '#ddd6fe',
  premiumBorderAlt: '#C084FC',
  premiumSurface: '#f5f3ff',
  premiumStrong: '#4c1d95',
  premiumText: '#5b21b6',
  premiumIcon: '#7c3aed',

  // Semantic colors
  danger: '#ef4444',
  info: '#1d4ed8',
  infoMuted: '#1e40af',
  success: '#4CAF50',
  successDark: '#10B981',
  successDarker: '#388E3C',
  warning: '#FF9800',
  highlight: '#facc15',

  // Neutral colors
  borderSubtle: '#e5e7eb',
  slate400: '#9ca3af',
  slate500: '#6b7280',
  neutralBg: '#f3f4f6',
  neutralBorder: '#e5e7eb',
  neutralText: '#6b7280',
  textStrong: '#111827',
  textMuted: '#70737a',
  textGray: '#666',
  surfaceMuted: '#f7f8fb',
  surfaceOverlay: '#fff8',
  bgSubtle: '#F5F5F5',
  bgWhiteish: '#FAFAFA',

  // Token/Gold colors
  token: '#a16207',
  tokenSurface: 'rgba(250, 204, 21, 0.15)',
  tokenGold: '#facc15',
  tokenStar: '#FFD700',

  // Info surfaces
  infoSurface: '#eff6ff',
  infoBorder: '#bfdbfe',
  infoStrong: '#1e3a8a',

  // Warning surfaces
  warningSurface: '#fff7ed',
  warningBorder: '#fed7aa',
  warningStrong: '#7c2d12',
  warningText: '#9a3412',
  warningIcon: '#ea580c',
  warningAlertBg: '#FFF3CD',
  warningAlertBorder: '#FFE69C',
  warningAlertText: '#856404',

  // Stats colors (para tarjetas de estadísticas)
  statsBlue: { bg: '#E3F2FD', text: '#1976D2' },
  statsGreen: { bg: '#E8F5E9', text: '#388E3C' },
  statsPurple: { bg: '#F3E8FF', text: '#9333EA' },
  statsOrange: { bg: '#FFF3E0', text: '#E65100' },

  // Switch colors
  switchTrackOff: '#D1D5DB',
  switchTrackOn: '#4F9CF9',
  switchThumb: '#FFFFFF',

  // Overlay colors (transparencias)
  overlayDark: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  overlayBlue: 'rgba(59, 130, 246, 0.12)',
  overlayGreen: 'rgba(16, 185, 129, 0.12)',
} as const;

/**
 * Alias para compatibilidad backward con código existente
 * @deprecated Usa colorPalette en lugar de palette
 */
export const palette = colorPalette;

// ============================================================================
// SPACING SYSTEM - Sistema de espaciado basado en escala 4px
// ============================================================================

/**
 * Escala de espaciado basada en múltiplos de 4px.
 * Uso: spacing.md = 12px, spacing.lg = 16px
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
  '7xl': 56,
  '8xl': 64,
  '10xl': 80,
  '12xl': 96,
} as const;

/**
 * Helper para acceder a valores de spacing
 * @example sp('lg') → 16
 */
export const sp = (key: keyof typeof spacing): number => spacing[key];

// ============================================================================
// RADIUS SYSTEM - Sistema de esquinas redondeadas
// ============================================================================

/**
 * Escala de border radius.
 * Uso: radius.md = 8px, radius.lg = 12px
 */
export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

/**
 * Helper para acceder a valores de radius
 * @example rad('lg') → 12
 */
export const rad = (key: keyof typeof radius): number => radius[key];

// ============================================================================
// TYPOGRAPHY SYSTEM - Sistema de tipografía
// ============================================================================

/**
 * Sistema de tipografía con tamaños, pesos y alturas de línea.
 */
export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 22,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },

  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * Helper para acceder a valores de tipografía
 * @example font('fontSize', 'lg') → 18
 */
export const font = <K extends keyof typeof typography>(
  category: K,
  key?: keyof typeof typography[K],
): number | string => {
  if (key) {
    return typography[category][key];
  }
  return typography[category];
};

// ============================================================================
// COMPOSITE THEME - Composición de tema con spacing como función
// ============================================================================

/**
 * Light theme - Composición completa del tema claro
 * Mantiene spacing como función para backward compatibility
 */
export const lightTheme = {
  colors: {
    bg: '#FAFAFA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    subtext: '#666666',
    primary: colorPalette.gymSecondary,
    primaryText: '#FFFFFF',
    border: '#DDDDDD',
    inputBg: '#FFFFFF',
    inputBorder: '#DDDDDD',
    success: colorPalette.success,
    warning: colorPalette.warning,
    danger: colorPalette.danger,
    muted: '#E0E0E0',
    textMuted: '#999999',
    onPrimary: '#FFFFFF',
  },
  spacing: (v: number) => v * 8, // Función para backward compatibility
  spacingTokens: spacing, // Tokens directo para nuevo código
  radius,
  typography,
} as const;

/**
 * Dark theme (placeholder - implementar cuando sea necesario)
 */
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    bg: '#0F1419',
    card: '#1A1F2E',
    text: '#FFFFFF',
    subtext: '#B0B8C8',
    border: '#2C3444',
    inputBg: '#252B3D',
    inputBorder: '#2C3444',
  },
} as const;

export type AppTheme = typeof lightTheme;

// ============================================================================
// TYPE EXPORTS - Tipos para TypeScript
// ============================================================================

export type ColorPalette = typeof colorPalette;
export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;
export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
export type LineHeightKey = keyof typeof typography.lineHeight;
