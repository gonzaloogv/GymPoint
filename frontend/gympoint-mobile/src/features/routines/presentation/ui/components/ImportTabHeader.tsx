import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SegmentedControl } from '@shared/components/ui';

type Tab = {
  value: string;
  label: string;
};

type Props = {
  title: string;
  description: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function ImportTabHeader({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const background = isDark ? '#111827' : '#ffffff';
  const border = isDark ? 'rgba(55, 65, 81, 0.6)' : '#E5E7EB';
  const overline = isDark ? '#9CA3AF' : '#6B7280';
  const descriptionColor = isDark ? '#9CA3AF' : '#4B5563';

  return (
    <View
      className="px-5 pt-[18px] pb-5 border-b"
      style={{ backgroundColor: background, borderBottomColor: border }}
    >
      <Text
        className="text-[13px] font-bold uppercase mb-2"
        style={{ color: overline, letterSpacing: 0.8 }}
      >
        {title}
      </Text>
      <Text
        className="text-sm leading-5 mb-[18px]"
        style={{ color: descriptionColor }}
      >
        {description}
      </Text>
      <View className="items-center">
        <SegmentedControl options={tabs} value={activeTab} onChange={onTabChange} />
      </View>
    </View>
  );
}
