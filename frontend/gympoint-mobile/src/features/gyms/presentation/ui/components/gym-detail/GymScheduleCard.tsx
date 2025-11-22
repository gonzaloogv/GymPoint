import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { InfoCard } from '@shared/components/ui';
import { ScheduleCard } from '../ScheduleCard';

interface Schedule {
  day_of_week: string;
  opening_time: string;
  closing_time: string;
  closed: boolean;
}

interface GymScheduleCardProps {
  schedules: Schedule[];
}

export function GymScheduleCard({ schedules }: GymScheduleCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  if (!schedules || schedules.length === 0) {
    return null;
  }

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              className="w-14 h-14 rounded-[20px] border items-center justify-center mr-[14px]"
              style={{
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.24)' : 'rgba(129, 140, 248, 0.16)',
                borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
              }}
            >
              <Feather name="clock" size={20} color={isDark ? '#C7D2FE' : '#4338CA'} />
            </View>
            <Text
              className="text-lg font-bold"
              style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
            >
              Horarios
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View className="mt-4">
          <ScheduleCard schedules={schedules} isDark={isDark} />
        </View>
      )}
    </InfoCard>
  );
}
