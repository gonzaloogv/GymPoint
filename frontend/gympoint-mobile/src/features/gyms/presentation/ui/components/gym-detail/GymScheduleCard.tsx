import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
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

  if (!schedules || schedules.length === 0) {
    return null;
  }

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      <View className="flex-row items-center mb-4">
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
      <ScheduleCard schedules={schedules} isDark={isDark} />
    </InfoCard>
  );
}
