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

  return (
    <View className="w-full mb-5">
      <View
        className="flex-row rounded-[24px] p-1.5 border"
        style={{
          backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
          borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
        }}
      >
        {(['available', 'codes'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className="flex-1 px-4 py-3 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: activeTab === tab ? '#3B82F6' : 'transparent',
            }}
            onPress={() => onTabChange(tab)}
          >
            <Text
              className="text-center font-semibold text-base"
              style={{
                color: activeTab === tab ? '#F9FAFB' : isDark ? '#9CA3AF' : '#6B7280',
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
