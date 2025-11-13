/**
 * Screen Palettes - Centralized color palettes for screen headers
 *
 * Antes: Lógica duplicada en 5 archivos:
 * - HomeHeader.tsx (colores inline)
 * - RoutinesHeader.tsx (useMemo con paleta)
 * - GymScreenHeader.tsx (useMemo con paleta casi idéntica)
 * - ProgressOverviewHeader.tsx (3 variables inline)
 * - RewardsHeader.tsx (colores inline)
 *
 * AHORA: Usar createScreenPalette(isDark) para obtener los colores
 * BENEFICIO: Single source of truth, mantenimiento centralizado
 */

import { colorPalette } from './tokens';

/**
 * Paleta estándar para headers de pantalla
 * Se usa en todas las pantallas principales
 */
export interface ScreenPalette {
  // Text colors
  title: string;
  subtitle: string;
  textSecondary: string;
  filterIcon: string;

  // Backgrounds y pills
  pillBg: string;
  pillBorder: string;
  pillText: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;

  // Dividers y separadores
  divider: string;

  // Semantic colors (para ActionCard y otros)
  helpIconColor: string;
  helpIconBg: string;
  streakIconBg: string;

  // Card backgrounds
  cardBg: string;
  cardBorder: string;
  cardBorderColor: string;
}

/**
 * Create screen palette based on theme
 * Reemplaza los 5 useMemo/inline palettes diferentes
 *
 * @param isDark - Whether dark mode is enabled
 * @returns ScreenPalette con todos los colores para el tema actual
 *
 * @example
 * const { theme } = useTheme();
 * const palette = createScreenPalette(theme === 'dark');
 * // Use: palette.title, palette.activeBg, etc.
 */
export const createScreenPalette = (isDark: boolean): ScreenPalette => ({
  // Text colors - CENTRALIZADOS (Antes duplicados en 5 archivos)
  title: isDark ? '#F9FAFB' : '#111827',
  subtitle: isDark ? '#9CA3AF' : '#6B7280',
  textSecondary: isDark ? '#D1D5DB' : '#6B7280',
  filterIcon: isDark ? '#9CA3AF' : '#6B7280',

  // Pills y buttons interactivos
  // Usado en: RoutinesHeader, GymScreenHeader (tabs), RewardsScreen
  pillBg: isDark ? 'rgba(31, 41, 55, 0.9)' : '#F3F4F6',
  pillBorder: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
  pillText: isDark ? '#E5E7EB' : '#374151',
  activeBg: isDark ? 'rgba(79, 70, 229, 0.24)' : 'rgba(129, 140, 248, 0.2)',
  activeBorder: isDark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(129, 140, 248, 0.28)',
  activeText: isDark ? '#C7D2FE' : '#4338CA',

  // Dividers y separadores (usado en RewardsHeader)
  divider: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)',

  // ActionCard y elementos decorativos (usado en ProgressOverviewHeader)
  helpIconColor: isDark ? '#FDE68A' : '#B45309',
  helpIconBg: isDark ? 'rgba(251, 191, 36, 0.14)' : 'rgba(251, 191, 36, 0.18)',
  streakIconBg: isDark ? 'rgba(79, 70, 229, 0.18)' : 'rgba(129, 140, 248, 0.18)',

  // Card backgrounds (usado en RewardsHeader)
  cardBg: isDark ? '#111827' : '#ffffff',
  cardBorder: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.2)',
  cardBorderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.2)',
});

/**
 * Preset palettes para uso directo si necesitas
 */
export const lightPalette = createScreenPalette(false);
export const darkPalette = createScreenPalette(true);

/**
 * Shadow styles - sombras consistentes across the app
 * Evita duplicación de shadowColor, shadowOpacity, etc.
 */
export const createShadowStyles = (isDark: boolean) => ({
  // Elevated shadow (usado en RewardsHeader cards)
  elevated: isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 24,
        elevation: 10,
      }
    : {
        shadowColor: '#FACC15',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 22,
        elevation: 5,
      },

  // Medium shadow
  medium: isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 4,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 12,
        elevation: 2,
      },

  // Light shadow (subtle)
  light: isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 2,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 1,
      },
});