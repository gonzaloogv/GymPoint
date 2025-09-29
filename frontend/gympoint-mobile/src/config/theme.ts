export const lightTheme = {
  colors: {
    bg: '#F7F8FB',
    card: '#FFFFFF',
    text: '#1E1F24',
    subtext: '#707686',
    primary: '#4C3AFF',        // morado del wireframe
    primaryText: '#FFFFFF',
    border: '#E6C9EF',
    inputBg: '#FFFFFF',
    inputBorder: '#DADDE6',
    success: '#12D18E',
    warning: '#FFA629',
    muted: '#70737A',        // alias de subtext
    textMuted: '#70737A',    // alias de subtext
    onPrimary: '#FFFFFF',
    danger: '#EF4444',
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
