import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type TimePeriod = '7d' | '30d' | '90d' | '12m';

interface TimePeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const PERIOD_LABELS: Record<TimePeriod, string> = {
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
  '12m': 'Últimos 12 meses',
};

export function TimePeriodSelector({ value, onChange }: TimePeriodSelectorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);

  const bgColor = isDark ? '#1F2937' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const labelColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View className="mb-6">
      {/* Label */}
      <Text className="text-sm font-medium mb-2" style={{ color: labelColor }}>
        Período de tiempo
      </Text>

      {/* Dropdown Trigger */}
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between px-4 py-3 rounded-lg border"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <Text className="text-base" style={{ color: textColor }}>
          {PERIOD_LABELS[value]}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={isDark ? '#9CA3AF' : '#6B7280'}
        />
      </Pressable>

      {/* Modal Dropdown */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onPress={() => setIsOpen(false)}
        >
          <View
            className="w-80 rounded-xl p-2"
            style={{ backgroundColor: bgColor }}
          >
            {Object.entries(PERIOD_LABELS).map(([period, label]) => (
              <Pressable
                key={period}
                onPress={() => {
                  onChange(period as TimePeriod);
                  setIsOpen(false);
                }}
                className="px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: value === period
                    ? (isDark ? '#374151' : '#F3F4F6')
                    : 'transparent',
                }}
              >
                <Text
                  className="text-base"
                  style={{
                    color: value === period ? '#3B82F6' : textColor,
                    fontWeight: value === period ? '600' : '400',
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
