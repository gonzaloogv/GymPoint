import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

export const RecentActivity = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <View className="px-4 py-4">
      <Text className={isDark ? 'text-base font-bold mb-2 text-textPrimary-dark' : 'text-base font-bold mb-2 text-textPrimary'}>
        Actividad reciente
      </Text>
      <Text className={isDark ? 'mb-1 text-textSecondary-dark' : 'mb-1 text-textSecondary'}>
        Juan hizo check-in hace 2h
      </Text>
      <Text className={isDark ? 'mb-1 text-textSecondary-dark' : 'mb-1 text-textSecondary'}>
        María generó un código de descuento
      </Text>
    </View>
  );
};
