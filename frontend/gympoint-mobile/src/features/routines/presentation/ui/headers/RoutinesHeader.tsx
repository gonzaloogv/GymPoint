import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type RoutinesHeaderProps = {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
};

/**
 * Header personalizado para pantallas de rutinas
 * Similar al header de PhysicalProgressScreen
 */
export function RoutinesHeader({
  title = 'Mis Rutinas',
  showBackButton = false,
  onBackPress,
}: RoutinesHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View className={`px-4 pt-4 pb-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header con botón de volver */}
      {showBackButton && (
        <View className="flex-row items-center justify-between mb-2">
          <Pressable onPress={handleBackPress} className="flex-row items-center">
            <Ionicons
              name="chevron-back"
              size={28}
              color={isDark ? '#60A5FA' : '#3B82F6'}
            />
            <Text className={`ml-1 text-base font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Volver
            </Text>
          </Pressable>
          <Ionicons
            name="information-circle"
            size={24}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      )}

      {/* Título */}
      <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </Text>
    </View>
  );
}
