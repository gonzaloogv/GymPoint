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
} as const;
