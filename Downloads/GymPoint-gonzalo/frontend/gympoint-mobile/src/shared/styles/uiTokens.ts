// helpers de spacing/radius/typography centralizados
export const sp = (theme: any, n: number) =>
  typeof theme?.spacing === 'function'
    ? theme.spacing(n)
    : typeof theme?.spacing === 'number'
      ? theme.spacing * n
      : (theme?.spacing?.[n] ?? n * 8);

export const rad = (theme: any, key: string, fallback = 12) =>
  typeof theme?.radius === 'number' ? theme.radius : (theme?.radius?.[key] ?? fallback);

export const font = (theme: any, key: string, fallback = 14) =>
  typeof theme?.typography?.[key] === 'number' ? theme.typography[key] : fallback;

export const palette = {
  borderSubtle: '#e5e7eb',
  slate400: '#9ca3af',
  slate500: '#6b7280',
  surfaceOverlay: '#fff8',
  gymPrimary: '#3b82f6',
  gymSecondary: '#4F9CF9',
  lifestylePrimary: '#10b981',
  premiumPrimary: '#8b5cf6',
  danger: '#ef4444',
  info: '#1d4ed8',
  infoMuted: '#1e40af',
  highlight: '#facc15',
  neutralBg: '#f3f4f6',
  neutralBorder: '#e5e7eb',
  neutralText: '#6b7280',
  textStrong: '#111827',
  textMuted: '#70737a',
  textGray: '#666',
  surfaceMuted: '#f7f8fb',
  token: '#a16207',
  tokenSurface: 'rgba(250, 204, 21, 0.15)',
  infoSurface: '#eff6ff',
  infoBorder: '#bfdbfe',
  infoStrong: '#1e3a8a',
  premiumSurface: '#f5f3ff',
  premiumBorder: '#ddd6fe',
  premiumStrong: '#4c1d95',
  premiumText: '#5b21b6',
  premiumIcon: '#7c3aed',
  warningSurface: '#fff7ed',
  warningBorder: '#fed7aa',
  warningStrong: '#7c2d12',
  warningText: '#9a3412',
  warningIcon: '#ea580c',

  // Premium extended colors (centralizados)
  premiumDark: '#9333EA',
  premiumLight: '#7C3AED',
  premiumBg: '#F3E8FF',
  premiumBorderAlt: '#C084FC',

  // Success/Green colors
  success: '#4CAF50',
  successDark: '#10B981',
  successDarker: '#388E3C',

  // Stats colors (para tarjetas de estadísticas)
  statsBlue: { bg: '#E3F2FD', text: '#1976D2' },
  statsGreen: { bg: '#E8F5E9', text: '#388E3C' },
  statsPurple: { bg: '#F3E8FF', text: '#9333EA' },
  statsOrange: { bg: '#FFF3E0', text: '#E65100' },

  // Token/Gold colors
  tokenGold: '#facc15',
  tokenStar: '#FFD700',

  // Warning alert colors
  warningAlertBg: '#FFF3CD',
  warningAlertBorder: '#FFE69C',
  warningAlertText: '#856404',

  // Neutral/Gray variations
  bgSubtle: '#F5F5F5',
  bgWhiteish: '#FAFAFA',

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
