import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Avatar, TokenPill } from '@shared/components/ui';
import StreakIcon from '@assets/icons/streak.svg';

type Props = {
  userName: string;
  plan: 'Free' | 'Premium';
  tokens: number;
  streak?: number;
  onBellPress?: () => void;
};

export default function HomeHeader({ userName, plan, tokens, streak = 0 }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const parts = (userName || '').trim().split(/\s+/);
  const firstName = parts[0] ?? userName ?? 'Usuario';

  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-1 flex-row items-center">
        <Avatar userName={userName} />
        <View className="ml-3 flex-1 mr-2">
          <Text
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Hola, {firstName}
          </Text>
          <Text
            className="mt-1 uppercase text-[11px] tracking-[3px]"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            Plan {plan}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <TokenPill value={tokens} />
        <View
          className="flex-row items-center px-3 py-1.5 rounded-full border"
          style={{
            backgroundColor: isDark ? 'rgba(79, 70, 229, 0.18)' : 'rgba(129, 140, 248, 0.18)',
            borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
            shadowColor: 'rgba(79, 70, 229, 0.45)',
            shadowOpacity: 0.16,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 14,
            elevation: 5,
          }}
        >
          <StreakIcon width={20} height={20} accessibilityLabel="racha" />
          <Text className="ml-1 font-semibold" style={{ color: isDark ? '#C7D2FE' : '#4338CA' }}>
            {streak}
          </Text>
        </View>
      </View>
    </View>
  );
}
