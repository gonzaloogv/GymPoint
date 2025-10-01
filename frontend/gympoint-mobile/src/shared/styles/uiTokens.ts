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
} as const;
