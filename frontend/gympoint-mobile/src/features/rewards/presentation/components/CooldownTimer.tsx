import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getFutureTimeString } from '@shared/utils/dateUtils';
import { useTheme } from '@shared/hooks';

interface Props {
  endsAt: string;
  compact?: boolean;
}

export const CooldownTimer: React.FC<Props> = ({ endsAt, compact = false }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const updateTime = () => {
      try {
        const remaining = getFutureTimeString(endsAt);
        setTimeRemaining(remaining);
      } catch (error) {
        console.error('[CooldownTimer] Error formatting date:', error);
        setTimeRemaining('tiempo desconocido');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endsAt]);

  if (compact) {
    return (
      <View
        className="rounded-2xl px-3 py-2 border flex-row items-center gap-1"
        style={{
          backgroundColor: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
          borderColor: isDark ? 'rgba(251, 146, 60, 0.35)' : 'rgba(251, 146, 60, 0.25)',
        }}
      >
        <Ionicons name="time-outline" size={12} color="#FB923C" />
        <Text className="text-[10px] font-semibold" style={{ color: '#FB923C' }}>
          {timeRemaining}
        </Text>
      </View>
    );
  }

  return (
    <View
      className="rounded-2xl px-3 py-2 border flex-row items-center gap-2"
      style={{
        backgroundColor: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
        borderColor: isDark ? 'rgba(251, 146, 60, 0.35)' : 'rgba(251, 146, 60, 0.25)',
      }}
    >
      <Ionicons name="time-outline" size={18} color="#FB923C" />
      <View className="flex-1">
        <Text className="text-xs font-medium" style={{ color: isDark ? '#9CA3AF' : '#78716C' }}>
          Se renueva {timeRemaining}
        </Text>
      </View>
    </View>
  );
};
