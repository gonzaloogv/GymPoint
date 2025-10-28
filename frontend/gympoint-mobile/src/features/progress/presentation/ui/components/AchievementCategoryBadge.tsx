import React from 'react';
import { View, Text } from 'react-native';
import { AchievementCategory } from '../../../domain/entities/Achievement';
import { useTheme } from '@shared/hooks';

interface AchievementCategoryBadgeProps {
  category: AchievementCategory;
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  ONBOARDING: 'Inicio',
  STREAK: 'Racha',
  FREQUENCY: 'Frecuencia',
  ATTENDANCE: 'Asistencia',
  ROUTINE: 'Rutinas',
  CHALLENGE: 'Desafíos',
  PROGRESS: 'Progreso',
  TOKEN: 'Tokens',
  SOCIAL: 'Social',
};

const CATEGORY_COLORS: Record<AchievementCategory, { light: string; dark: string; text: string }> = {
  ONBOARDING: { light: '#DBEAFE', dark: '#1E3A8A', text: '#1D4ED8' },
  STREAK: { light: '#FEF3C7', dark: '#78350F', text: '#D97706' },
  FREQUENCY: { light: '#D1FAE5', dark: '#064E3B', text: '#059669' },
  ATTENDANCE: { light: '#E0E7FF', dark: '#312E81', text: '#4F46E5' },
  ROUTINE: { light: '#FCE7F3', dark: '#831843', text: '#DB2777' },
  CHALLENGE: { light: '#FEE2E2', dark: '#7F1D1D', text: '#DC2626' },
  PROGRESS: { light: '#CCFBF1', dark: '#134E4A', text: '#14B8A6' },
  TOKEN: { light: '#FEF9C3', dark: '#713F12', text: '#CA8A04' },
  SOCIAL: { light: '#F3E8FF', dark: '#581C87', text: '#9333EA' },
};

export const AchievementCategoryBadge: React.FC<AchievementCategoryBadgeProps> = ({ category }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = CATEGORY_COLORS[category];
  const bgColor = isDark ? colors.dark : colors.light;

  return (
    <View
      className="px-2 py-0.5 rounded-full self-start"
      style={{ backgroundColor: bgColor }}
    >
      <Text
        className="text-xs font-medium"
        style={{ color: colors.text }}
      >
        {CATEGORY_LABELS[category]}
      </Text>
    </View>
  );
};
