import React from 'react';
import { View, Text } from 'react-native';
import { Schedule } from '@features/gyms/domain/entities/Schedule';
import { Card } from '@shared/components/ui';

interface ScheduleCardProps {
  schedules: Schedule[];
  isDark: boolean;
}

// Map day_of_week strings to display names and numeric values
const DAY_MAP: Record<string, { name: string; num: number }> = {
  dom: { name: 'Domingo', num: 0 },
  lun: { name: 'Lunes', num: 1 },
  mar: { name: 'Martes', num: 2 },
  mie: { name: 'Miércoles', num: 3 },
  jue: { name: 'Jueves', num: 4 },
  vie: { name: 'Viernes', num: 5 },
  sab: { name: 'Sábado', num: 6 },
};

export function ScheduleCard({ schedules, isDark }: ScheduleCardProps) {
  if (!schedules || schedules.length === 0) {
    return null;
  }

  // Sort schedules by day of week
  const sortedSchedules = [...schedules].sort((a, b) => {
    const dayA = DAY_MAP[a.day_of_week]?.num ?? 0;
    const dayB = DAY_MAP[b.day_of_week]?.num ?? 0;
    return dayA - dayB;
  });

  const today = new Date().getDay();

  return (
    <Card>
      <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
        Horarios de apertura
      </Text>

      <View className="gap-2">
        {sortedSchedules.map((schedule, index) => {
          const dayInfo = DAY_MAP[schedule.day_of_week];
          const dayName = dayInfo?.name || schedule.day_of_week;
          const dayNum = dayInfo?.num;
          const isToday = dayNum === today;

          return (
            <View
              key={index}
              className={`flex-row items-center justify-between py-2 px-3 rounded-lg ${
                isToday
                  ? isDark ? 'bg-blue-500/30' : 'bg-blue-100'
                  : isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'
              }`}
            >
              <View className="flex-row items-center flex-1">
                {isToday && (
                  <View className="w-2 h-2 bg-primary rounded-full mr-2" />
                )}
                <Text
                  className={`text-sm font-medium ${
                    isToday
                      ? isDark ? 'text-blue-400' : 'text-primary'
                      : isDark ? 'text-text-dark' : 'text-text'
                  }`}
                >
                  {dayName}
                </Text>
              </View>

              <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                {schedule.closed
                  ? 'Cerrado'
                  : schedule.opening_time && schedule.closing_time
                    ? `${schedule.opening_time.substring(0, 5)} - ${schedule.closing_time.substring(0, 5)}`
                    : 'No disponible'
                }
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
