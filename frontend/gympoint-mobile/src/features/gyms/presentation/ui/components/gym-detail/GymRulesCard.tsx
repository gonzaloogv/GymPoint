import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InfoCard } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

interface GymRulesCardProps {
  rules: string[];
}

export function GymRulesCard({ rules }: GymRulesCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const showEmpty = !rules || rules.length === 0;

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      {/* Header */}
      <View className="flex-row items-center mb-[14px]">
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center mr-[14px]"
          style={{
            backgroundColor: isDark ? 'rgba(248, 113, 113, 0.18)' : 'rgba(248, 113, 113, 0.12)',
            borderColor: isDark ? 'rgba(248, 113, 113, 0.38)' : 'rgba(248, 113, 113, 0.24)',
          }}
        >
          <Feather name="alert-triangle" size={20} color={isDark ? '#FCA5A5' : '#DC2626'} />
        </View>
        <Text
          className="text-lg font-bold"
          style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
        >
          Normas del gimnasio
        </Text>
      </View>

      {/* Content */}
      {showEmpty ? (
        <Text
          className="text-sm"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280', lineHeight: 20 }}
        >
          El gimnasio no tiene reglas registradas.
        </Text>
      ) : (
        <View className="gap-[14px]">
          {rules.map((rule, index) => (
            <View key={`${rule}-${index}`} className="flex-row items-start">
              <View
                className="w-7 h-7 rounded-full items-center justify-center mr-3 mt-0.5"
                style={{
                  backgroundColor: isDark ? 'rgba(248, 113, 113, 0.18)' : 'rgba(248, 113, 113, 0.14)',
                }}
              >
                <Text className="text-xs font-bold" style={{ color: isDark ? '#F87171' : '#DC2626' }}>
                  {index + 1}
                </Text>
              </View>
              <Text
                className="flex-1 text-sm"
                style={{ color: isDark ? '#F9FAFB' : '#111827', lineHeight: 20 }}
              >
                {rule}
              </Text>
            </View>
          ))}
        </View>
      )}
    </InfoCard>
  );
}

