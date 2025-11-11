import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getFutureTimeString } from '@shared/utils/dateUtils';
import { useRewardsStore } from '../state/rewards.store';
import { ActiveRewardEffect } from '../../domain/entities/Reward';
import { useTheme } from '@shared/hooks';

export const ActiveEffectsBanner: React.FC = () => {
  const { activeEffects, fetchActiveEffects } = useRewardsStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchActiveEffects();

    // Refresh every minute to update countdown
    const interval = setInterval(fetchActiveEffects, 60000);
    return () => clearInterval(interval);
  }, [fetchActiveEffects]);

  if (!activeEffects || activeEffects.effects.length === 0) {
    return null;
  }

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: '#F97316',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 22,
        elevation: 6,
      };

  return (
    <View
      className="rounded-[28px] px-5 py-[18px] border"
      style={[
        {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: isDark ? 'rgba(249, 115, 22, 0.4)' : 'rgba(249, 115, 22, 0.3)',
        },
        shadowStyle,
      ]}
    >
      {/* Header con icon container */}
      <View className="flex-row items-center gap-3 mb-3">
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(249, 115, 22, 0.22)' : 'rgba(249, 115, 22, 0.15)',
            borderColor: isDark ? 'rgba(249, 115, 22, 0.5)' : 'rgba(249, 115, 22, 0.35)',
          }}
        >
          <Ionicons name="flame" size={22} color="#F97316" />
        </View>

        <View className="flex-1">
          <Text
            className="text-lg font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            Efectos Activos
          </Text>
          {activeEffects.totalMultiplier > 1 && (
            <Text className="text-[13px] font-medium leading-[18px] text-[#78716C]">
              Ganando {activeEffects.totalMultiplier}x tokens
            </Text>
          )}
        </View>

        {/* Multiplier Badge */}
        {activeEffects.totalMultiplier > 1 && (
          <View
            className="rounded-2xl px-3 py-2 border"
            style={{
              backgroundColor: 'rgba(249, 115, 22, 0.2)',
              borderColor: '#F97316',
            }}
          >
            <Text className="text-base font-bold" style={{ color: '#F97316' }}>
              x{activeEffects.totalMultiplier}
            </Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View className="h-px rounded-full mb-3" style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)' }} />

      {/* Effects List */}
      <View className="flex-row flex-wrap gap-2">
        {activeEffects.effects.map((effect) => (
          <EffectChip key={effect.id} effect={effect} isDark={isDark} />
        ))}
      </View>
    </View>
  );
};

interface EffectChipProps {
  effect: ActiveRewardEffect;
  isDark: boolean;
}

const EffectChip: React.FC<EffectChipProps> = ({ effect, isDark }) => {
  const timeRemaining = getFutureTimeString(effect.expiresAt);

  return (
    <View
      className="rounded-2xl px-3 py-2 border"
      style={{
        backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.1)',
        borderColor: isDark ? 'rgba(249, 115, 22, 0.35)' : 'rgba(249, 115, 22, 0.25)',
      }}
    >
      <Text className="text-xs font-bold" style={{ color: '#F97316' }}>
        x{effect.multiplierValue}
      </Text>
      <Text className="text-[10px] mt-0.5" style={{ color: isDark ? '#9CA3AF' : '#78716C' }}>
        Expira {timeRemaining}
      </Text>
    </View>
  );
};
