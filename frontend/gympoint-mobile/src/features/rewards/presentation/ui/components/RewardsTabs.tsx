import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@shared/hooks';

type TabType = 'available' | 'codes';

type RewardsTabsProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export const RewardsTabs: React.FC<RewardsTabsProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgSecondary = isDark ? '#1f2937' : '#f3f4f6';
  const primaryColor = '#3B82F6';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <View className="w-full mb-5">
      <View
        className="flex-row rounded-xl p-1.5 border"
        style={{ backgroundColor: bgSecondary, borderColor }}
      >
        {(['available', 'codes'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className="flex-1 px-4 py-3 rounded-lg items-center justify-center"
            style={{
              backgroundColor: activeTab === tab ? primaryColor : 'transparent',
            }}
            onPress={() => onTabChange(tab)}
          >
            <Text
              className="text-center font-semibold text-base"
              style={{
                color: activeTab === tab ? '#ffffff' : mutedColor,
              }}
            >
              {tab === 'available' ? 'Disponibles' : 'Mis códigos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
