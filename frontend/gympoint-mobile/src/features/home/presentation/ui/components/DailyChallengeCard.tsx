import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { DailyChallenge } from '@features/home/domain/entities/DailyChallenge';

type Props = {
  challenge: DailyChallenge | null;
  onPress?: () => void;
};

export default function DailyChallengeCard({ challenge, onPress }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const completed = challenge?.progress ?? 0;
  const total = challenge?.target ?? 0;
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 24,
        elevation: 12,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 18,
        elevation: 6,
      };

  // Si no hay desafío del día
  if (!challenge) {
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        disabled={!onPress}
        onPress={onPress}
        className={`border rounded-[28px] px-5 py-[18px] mt-2 ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
        style={[
          {
            borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
          },
          shadowStyle,
        ]}
      >
        <View className="flex-row items-center">
          <View
            className="w-14 h-14 rounded-[20px] border items-center justify-center"
            style={{
              backgroundColor: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.18)',
              borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={22}
              color={isDark ? '#C7D2FE' : '#4338CA'}
            />
          </View>

          <View className="ml-4 flex-1">
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.6 }}
            >
              Desafío del día
            </Text>
            <Text
              className="mt-1.5 text-sm font-medium leading-5"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              No hay desafío disponible hoy
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Si hay desafío del día
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={!onPress}
      onPress={onPress}
      className={`border rounded-[28px] px-5 py-[18px] mt-2 ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}
      style={[
        {
          borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row items-center">
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.18)',
            borderColor: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
          }}
        >
          <Ionicons
            name={challenge.completed ? 'checkmark-circle' : 'sparkles'}
            size={22}
            color={isDark ? '#C7D2FE' : '#4338CA'}
          />
        </View>

        <View className="ml-4 flex-1">
          <Text
            className="text-xs font-semibold uppercase"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.6 }}
          >
            Desafío del día
          </Text>
          <Text
            className="mt-1.5 text-lg font-bold leading-6"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            {challenge.title}
          </Text>
          <Text
            className="mt-1.5 text-[13px] font-medium leading-[18px]"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            {challenge.description}
          </Text>
        </View>
      </View>

      <View
        className="h-2 rounded-full overflow-hidden mt-5"
        style={{
          backgroundColor: isDark ? '#1F2937' : '#E5E7EB',
        }}
      >
        <View
          className="h-full rounded-full"
          style={{
            backgroundColor: isDark ? '#8B5CF6' : '#4F46E5',
            width: `${progressPercentage}%`,
          }}
        />
      </View>

      <Text
        className="text-xs font-semibold mt-3 uppercase"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.4 }}
      >
        {challenge.completed
          ? `¡Completado! +${challenge.reward} tokens`
          : `Progreso: ${completed}/${total} ${challenge.unit || ''}`}
      </Text>
    </TouchableOpacity>
  );
}
