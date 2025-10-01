/**
 * MenuOptions - Menú de opciones adicionales
 * Incluye opciones como idioma, privacidad, calificación y gestión de suscripción
 */

import React from 'react';
import { Feather } from '@expo/vector-icons';
import {
  Card,
  MenuItem,
  MenuItemLeft,
  MenuItemRight,
  BodyText,
  SmallText,
} from '../styles/ProfilesStyles';
import { AppTheme } from '@config/theme';

interface MenuOptionsProps {
  isPremium: boolean;
  theme: AppTheme;
}

export const MenuOptions: React.FC<MenuOptionsProps> = ({ isPremium, theme }) => {
  return (
    <Card theme={theme} style={{ padding: 0, overflow: 'hidden' }}>
      {/* Opción de Idioma */}
      <MenuItem theme={theme}>
        <MenuItemLeft theme={theme}>
          <Feather name="globe" size={18} color={theme.colors.subtext} />
          <BodyText>Idioma</BodyText>
        </MenuItemLeft>
        <MenuItemRight theme={theme}>
          <SmallText style={{ opacity: 0.6 }}>Español</SmallText>
          <Feather name="chevron-right" size={16} color={theme.colors.subtext} />
        </MenuItemRight>
      </MenuItem>

      {/* Opción de Privacidad y Seguridad */}
      <MenuItem theme={theme}>
        <MenuItemLeft theme={theme}>
          <Feather name="shield" size={18} color={theme.colors.subtext} />
          <BodyText>Privacidad y seguridad</BodyText>
        </MenuItemLeft>
        <Feather name="chevron-right" size={16} color={theme.colors.subtext} />
      </MenuItem>

      {/* Opción de Calificar App */}
      <MenuItem theme={theme}>
        <MenuItemLeft theme={theme}>
          <Feather name="star" size={18} color={theme.colors.subtext} />
          <BodyText>Calificar app</BodyText>
        </MenuItemLeft>
        <Feather name="chevron-right" size={16} color={theme.colors.subtext} />
      </MenuItem>

      {/* Opción de Gestionar Suscripción (solo para Premium) */}
      {isPremium && (
        <MenuItem theme={theme} style={{ borderBottomWidth: 0 }}>
          <MenuItemLeft theme={theme}>
            <Feather name="credit-card" size={18} color={theme.colors.subtext} />
            <BodyText>Gestionar suscripción</BodyText>
          </MenuItemLeft>
          <Feather size={16} color={theme.colors.subtext} />
        </MenuItem>
      )}
    </Card>
  );
};