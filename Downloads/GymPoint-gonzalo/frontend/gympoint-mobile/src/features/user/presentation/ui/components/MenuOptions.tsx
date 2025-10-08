/**
 * MenuOptions - Menú de opciones adicionales
 * Incluye opciones como idioma, privacidad, calificación y gestión de suscripción
 */

import React from 'react';
import { MenuList } from '@shared/components/ui';

interface MenuOptionsProps {
  isPremium: boolean;
  theme?: any;
}

export const MenuOptions: React.FC<MenuOptionsProps> = ({ isPremium, theme }) => {
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

  return <MenuList items={menuItems} />;
};
