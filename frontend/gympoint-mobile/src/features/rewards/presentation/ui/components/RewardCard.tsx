import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Reward } from '@features/rewards/domain/entities';

type RewardCardProps = {
  reward: Reward;
  tokens: number;
  onGenerate: (reward: Reward) => void;
  getCategoryColor: (category: string) => string;
  getCategoryName: (category: string) => string;
};

export function RewardCard({
  reward,
  tokens,
  onGenerate,
  getCategoryColor,
  getCategoryName,
}: RewardCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isAffordable = tokens >= reward.cost;
  const isDisabled = !reward.available || !isAffordable;
  const categoryColor = getCategoryColor(reward.category);

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 22,
        elevation: 6,
      };

  // Definir colores del borde según categoría y tema
  const getBorderColor = () => {
    if (!reward.available) {
      return isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(148, 163, 184, 0.4)';
    }
    if (isAffordable) {
      // Verde si tiene tokens suficientes
      return isDark ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.4)';
    }
    // Gris neutral si no tiene tokens
    return isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';
  };

  return (
    <View
      className="rounded-[28px] px-5 py-[18px] border"
      style={[
        {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: getBorderColor(),
          opacity: reward.available ? 1 : 0.6,
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row gap-3">
        {/* Icon */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.22)' : '#E3F2FD',
          }}
        >
          <Text className="text-xl">{reward.icon}</Text>
        </View>

        {/* Info */}
        <View className="flex-1 gap-2">
          {/* Header Row */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 gap-1">
              <Text
                className="text-lg font-bold"
                style={{ color: isDark ? '#F9FAFB' : '#111827' }}
              >
                {reward.title}
              </Text>
              <Text className="text-[13px] font-medium leading-[18px] text-[#78716C]">
                {reward.description}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Ionicons name="flash" size={14} color="#F59E0B" />
              <Text className="text-sm font-semibold text-[#F59E0B]">{reward.cost}</Text>
            </View>
          </View>

          {/* Badge Wrapper */}
          <View className="flex-row justify-between items-center">
            <View
              className="rounded-2xl px-3 py-2 border"
              style={{
                backgroundColor: `${categoryColor}20`,
                borderColor: categoryColor,
              }}
            >
              <Text className="text-xs font-semibold uppercase" style={{ color: categoryColor, letterSpacing: 0.6 }}>
                {getCategoryName(reward.category)}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={12} color="#64748B" />
              <Text className="text-xs text-[#64748B]">{reward.validDays} días</Text>
            </View>
          </View>

          {/* Terms */}
          {reward.terms && (
            <Text className="text-xs text-[#78716C] italic">{reward.terms}</Text>
          )}

          {/* Button */}
          <TouchableOpacity
            onPress={() => onGenerate(reward)}
            disabled={isDisabled}
            activeOpacity={0.78}
            className="py-3.5 rounded-2xl items-center"
            style={{
              backgroundColor: isDisabled
                ? isDark
                  ? 'rgba(75, 85, 99, 0.22)'
                  : 'rgba(156, 163, 175, 0.16)'
                : isDark
                  ? '#4C51BF'
                  : '#4338CA',
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            <Text
              className="text-sm font-bold uppercase"
              style={{
                color: isDisabled ? (isDark ? '#9CA3AF' : '#78716C') : '#ffffff',
                letterSpacing: 0.6,
              }}
            >
              {!reward.available
                ? 'Solo Premium'
                : !isAffordable
                  ? `Faltan ${reward.cost - tokens} tokens`
                  : 'Reclamar recompensa'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
