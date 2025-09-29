import React from 'react';
import {
  DefaultTheme as NavDefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';

// Recibe tu theme de styled-components (solo usamos las claves de colores)
type AppColors = {
  bg?: string;
  card?: string;
  text?: string;
  primary?: string;
  border?: string;
  danger?: string;
};

export function useNavigationTheme(colors?: AppColors): NavigationTheme {
  const {
    bg = '#fff',
    card = bg,
    text = '#000',
    primary = '#4F9CF9',
    border = 'transparent',
    danger = '#F44336',
  } = colors ?? {};

  return React.useMemo(
    () => ({
      ...NavDefaultTheme,
      colors: {
        ...NavDefaultTheme.colors,
        primary,            // se usa en enlaces/acciones
        background: bg,     // fondo de NavigationContainer
        card,               // fondo de headers/cards
        text,               // texto por defecto de RN Navigation
        border,             // borde de headers/cards
        notification: danger,
      },
    }),
    [bg, card, text, primary, border, danger]
  );
}
