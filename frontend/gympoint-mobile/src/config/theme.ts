export const lightTheme = {
  colors: {
    bg: '#0F0F10',         // fondo app (oscuro elegante)
    card: '#17181A',
    primary: '#00E0A4',
    primaryText: '#0F0F10',
    text: '#EDEEF0',
    subtext: '#B6BAC3',
    danger: '#FF5A5F',
    border: '#2A2C30',
    inputBg: '#1F2124',
    inputBorder: '#2A2C30',
  },
  radius: { xs: 6, sm: 10, md: 14, lg: 20 },
  spacing: (v: number) => v * 8, // 8px grid
  typography: {
    h1: 28,
    h2: 22,
    body: 16,
    small: 14,
  },
} as const;

export type AppTheme = typeof lightTheme;
