/**
 * MenuOptions - Menú de opciones adicionales
 * Incluye opciones como idioma, privacidad, calificación y gestión de suscripción
 */

import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { MenuList } from '@shared/components/ui';
import { TabParamList, ProgressStackParamList } from '@presentation/navigation/types';

interface MenuOptionsProps {
  isPremium: boolean;
  theme?: any;
}

type ProgressNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Progreso'>,
  NativeStackNavigationProp<ProgressStackParamList>
>;

export const MenuOptions: React.FC<MenuOptionsProps> = ({ isPremium, theme }) => {
  const navigation = useNavigation<any>();

  const handleTokenHistoryPress = useCallback(() => {
    // Navigate to TokenHistory modal (no cambia el tab activo)
    navigation.navigate('TokenHistory' as never);
  }, [navigation]);

  const handleRewardsPress = useCallback(() => {
    // Navigate to Rewards modal (no cambia el tab activo)
    navigation.navigate('Rewards' as never);
  }, [navigation]);

  const menuItems = [
    // TODO: Descomentar cuando la app soporte múltiples idiomas
    // {
    //   icon: 'globe-outline' as const,
    //   title: 'Idioma',
    //   subtitle: 'Español',
    //   onPress: () => {},
    // },
    {
      icon: 'gift-outline' as const,
      title: 'Recompensas',
      subtitle: 'Canjes y ofertas',
      onPress: handleRewardsPress,
    },
    {
      icon: 'flash-outline' as const,
      title: 'Historial de tokens',
      subtitle: 'Ver historial',
      onPress: handleTokenHistoryPress,
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Privacidad y seguridad',
      onPress: () => {},
    },
    {
      icon: 'star-outline' as const,
      title: 'Calificar app',
      onPress: () => {},
    },
  ];

  // Agregar opción de gestión de suscripción solo para Premium
  if (isPremium) {
    menuItems.push({
      icon: 'star-outline' as const,
      title: 'Gestionar suscripción',
      onPress: () => {},
    });
  }

  return <MenuList items={menuItems} />;
};
