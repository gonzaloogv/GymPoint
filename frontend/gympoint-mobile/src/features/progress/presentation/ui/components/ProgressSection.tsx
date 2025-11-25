import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Ionicons } from '@expo/vector-icons';

type ProgressSectionProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  badge?: string;
};

export function ProgressSection({
  icon,
  title,
  description,
  onPress,
  badge,
}: ProgressSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const borderColor = isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';
  const backgroundColor = isDark ? '#111827' : '#ffffff';
  const titleColor = isDark ? '#F9FAFB' : '#111827';
  const descriptionColor = isDark ? '#9CA3AF' : '#6B7280';

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

  return (
    <Pressable
      onPress={onPress}
      className="border rounded-[28px] px-5 py-[18px]"
      style={[
        {
          borderColor,
          backgroundColor,
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row items-start gap-4">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(79, 70, 229, 0.18)' : 'rgba(79, 70, 229, 0.08)',
          }}
        >
          {icon}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-lg font-bold flex-1"
              style={{ color: titleColor }}
              numberOfLines={2}
            >
              {title}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={descriptionColor} />
          </View>
          {badge ? (
            <Text
              className="mt-1 text-[11px] font-semibold uppercase tracking-[2px]"
              style={{ color: descriptionColor }}
            >
              {badge}
            </Text>
          ) : null}
          <Text
            className="mt-2 text-[13px] leading-5"
            style={{ color: descriptionColor }}
          >
            {description}
          </Text>
        </View>
      </View>

    </Pressable>
  );
}
