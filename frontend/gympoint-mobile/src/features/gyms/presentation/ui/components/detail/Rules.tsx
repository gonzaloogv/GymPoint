import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

export const Rules = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <View className="px-4 py-4">
      <Text className={isDark ? 'text-base font-bold mb-1.5 text-textPrimary-dark' : 'text-base font-bold mb-1.5 text-textPrimary'}>
        Reglamento
      </Text>
      <Text className={isDark ? 'mb-1 text-textSecondary-dark' : 'mb-1 text-textSecondary'}>
        • Usar toalla obligatoria
      </Text>
      <Text className={isDark ? 'mb-1 text-textSecondary-dark' : 'mb-1 text-textSecondary'}>
        • No gritar ni soltar pesas
      </Text>
      <Text className={isDark ? 'mb-1 text-textSecondary-dark' : 'mb-1 text-textSecondary'}>
        • Respetar turnos en máquinas
      </Text>
    </View>
  );
};
