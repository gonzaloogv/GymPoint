import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Card, Button } from '@shared/components/ui';
import { palette } from '@shared/styles';
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

  return (
    <Card
      className={`${isAffordable ? 'border-2' : 'border-2'}`}
      style={{
        opacity: reward.available ? 1 : 0.5,
        borderColor: isAffordable ? palette.lifestylePrimary : palette.neutralBorder,
      }}
    >
      <View className="flex-row gap-3">
        {/* Icon */}
        <View className="w-12 h-12 rounded-full items-center justify-center bg-[#E3F2FD]">
          <Text className="text-xl">{reward.icon}</Text>
        </View>

        {/* Info */}
        <View className="flex-1 gap-2">
          {/* Header Row */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 gap-1">
              <Text className={`text-base font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                {reward.title}
              </Text>
              <Text className="text-sm text-[#78716C] leading-[18px]">
                {reward.description}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Ionicons name="flash" size={14} color={palette.highlight} />
              <Text className="text-sm font-semibold text-[#F59E0B]">{reward.cost}</Text>
            </View>
          </View>

          {/* Badge Wrapper */}
          <View className="flex-row justify-between items-center">
            <View
              className="rounded-xl px-2 py-1 border"
              style={{
                backgroundColor: `${categoryColor}20`,
                borderColor: categoryColor,
              }}
            >
              <Text className="text-xs font-medium" style={{ color: categoryColor }}>
                {getCategoryName(reward.category)}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Feather name="clock" size={10} color={palette.slate500} />
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
            activeOpacity={0.7}
            className={`rounded-xl items-center justify-center min-h-[44px] px-6 py-4 ${
              isDisabled ? 'bg-[#F5F5F4] opacity-50' : 'bg-primary'
            }`}
          >
            <Text
              className="font-semibold text-base"
              style={{
                color: isDisabled ? palette.textMuted : '#ffffff',
              }}
            >
              {!reward.available
                ? 'Solo Premium'
                : !isAffordable
                  ? `Faltan ${reward.cost - tokens} tokens`
                  : 'Generar código'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}
