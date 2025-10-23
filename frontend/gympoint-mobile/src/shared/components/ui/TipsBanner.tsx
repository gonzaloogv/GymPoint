import React from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type TipsBannerProps = {
  title?: string;
  tips: Array<{
    icon: keyof typeof Ionicons.glyphMap | keyof typeof Feather.glyphMap;
    iconType: 'ionicons' | 'feather';
    text: string;
  }>;
  iconColor?: string;
};

export function TipsBanner({ title = '💡 Tips', tips, iconColor }: TipsBannerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const infoColor = iconColor || '#3B82F6';
  const infoBg = isDark ? '#1e3a8a' : '#EFF6FF';
  const infoBorder = isDark ? '#1e40af' : '#BFDBFE';

  return (
    <View
      className="rounded-lg p-4 mt-4 gap-1.5"
      style={{
        backgroundColor: infoBg,
        borderColor: infoBorder,
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center gap-1">
        <Feather name="info" size={20} color={infoColor} />
        <Text className="text-base font-semibold" style={{ color: isDark ? '#e0e7ff' : '#1f2937' }}>
          {title}
        </Text>
      </View>

      <View className="gap-1">
        {tips.map((tip, index) => (
          <View key={index} className="flex-row items-center gap-1">
            {tip.iconType === 'ionicons' ? (
              <Ionicons
                name={tip.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={infoColor}
              />
            ) : (
              <Feather
                name={tip.icon as keyof typeof Feather.glyphMap}
                size={14}
                color={infoColor}
              />
            )}
            <Text className="flex-1 text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              {tip.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
