export const lightTheme = {
  colors: {
    bg: '#FAFAFA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    subtext: '#1A1A1A',
    primary: '#4F9CF9',
    primaryText: '#FFFFFF',
    border: '#DDDDDD',
    inputBg: '#FFFFFF',
    inputBorder: '#DDDDDD',
    success: '#4CAF50',
    warning: '#FF9800',
    muted: '#E0E0E0',
    textMuted: '#E0E0E0',
    onPrimary: '#FFFFFF',
    danger: '#F44336',
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
