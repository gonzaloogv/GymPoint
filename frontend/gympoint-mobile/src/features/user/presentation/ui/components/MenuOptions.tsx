/**
 * MenuOptions - Menú de opciones adicionales
 * Incluye opciones como idioma, privacidad, calificación y gestión de suscripción
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MenuList } from '@shared/components/ui';

interface MenuOptionsProps {
  isPremium: boolean;
  theme?: any;
  onTokenHistoryPress?: () => void;
  onRewardsPress?: () => void;
}

export const MenuOptions: React.FC<MenuOptionsProps> = ({ isPremium, theme, onTokenHistoryPress, onRewardsPress }) => {
  const menuItems = [
    {
      icon: 'globe',
      title: 'Idioma',
      subtitle: 'Español',
      onPress: () => {},
    },
    {
      icon: 'shield',
      title: 'Privacidad y seguridad',
      onPress: () => {},
    },
    {
      icon: 'gift',
      title: 'Recompensas',
      subtitle: 'Ver canjes y ofertas disponibles',
      onPress: onRewardsPress || (() => {}),
    },
    {
      icon: 'zap',
      title: 'Historial de tokens',
      onPress: onTokenHistoryPress || (() => {}),
    },
    {
      icon: 'star',
      title: 'Calificar app',
      onPress: () => {},
    },
  ];

  // Agregar opción de gestión de suscripción solo para Premium
  if (isPremium) {
    menuItems.push({
      icon: 'credit-card',
      title: 'Gestionar suscripción',
      onPress: () => {},
    });
  }

  return (
    <View style={{ marginTop: 16, marginBottom: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, paddingHorizontal: 0, color: '#111' }}>
        General
      </Text>
      <MenuList items={menuItems} />
    </View>
  );
};
