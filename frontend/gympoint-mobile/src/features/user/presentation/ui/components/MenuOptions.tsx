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
    // Navigate to the Progreso tab, then to TokenHistory screen
    navigation.navigate('Progreso', {
      screen: 'TokenHistory',
    } as any);
  }, [navigation]);

  const handleRewardsPress = useCallback(() => {
    // Navigate to the Progreso tab, then to Rewards screen
    navigation.navigate('Progreso', {
      screen: 'Rewards',
    } as any);
  }, [navigation]);

  const menuItems = [
    // TODO: Descomentar cuando la app soporte múltiples idiomas
    // {
    //   icon: 'globe',
    //   title: 'Idioma',
    //   subtitle: 'Español',
    //   onPress: () => {},
    // },
    {
      icon: 'gift',
      title: 'Recompensas',
      subtitle: 'Canjes y ofertas',
      onPress: handleRewardsPress,
    },
    {
      icon: 'zap',
      title: 'Historial de tokens',
      subtitle: 'Ver historial',
      onPress: handleTokenHistoryPress,
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
