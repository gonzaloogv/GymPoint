import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@shared/hooks';

// COMENTADO: Sistema sin códigos por ahora - tabs eliminados
// type TabType = 'available' | 'codes';

type RewardsTabsProps = {
  // Sin props necesarias por ahora - solo mostrar título
};

export const RewardsTabs: React.FC<RewardsTabsProps> = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const backgroundColor = isDark ? '#111827' : '#ffffff';
  const borderColor = isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 24,
        elevation: 10,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 22,
        elevation: 5,
      };

  return (
    <View className="w-full">
      <View
        className="rounded-[28px] px-6 py-4 border"
        style={[
          {
            backgroundColor,
            borderColor,
          },
          shadowStyle,
        ]}
      >
        <Text
          className="text-center font-semibold text-base"
          style={{
            color: '#3B82F6',
          }}
        >
          Recompensas Disponibles
        </Text>
      </View>
    </View>
  );
};
