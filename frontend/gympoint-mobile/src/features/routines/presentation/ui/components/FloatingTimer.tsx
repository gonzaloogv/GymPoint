import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { formatDuration } from '@shared/utils';
import { Ionicons } from '@expo/vector-icons';

type FloatingTimerState = 'idle' | 'running' | 'paused';

type Props = {
  timerState: FloatingTimerState;
  restSeconds: number;
  exerciseName?: string;
  onSkip?: () => void;
};

export function FloatingTimer({
  timerState,
  restSeconds,
  exerciseName = 'Descanso',
  onSkip,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (timerState === 'idle') {
    return null;
  }

  const seconds = Math.max(0, restSeconds);
  const formatted = formatDuration(seconds);
  const isWarning = seconds <= 5 && timerState === 'running';
  const accentColor = isWarning ? '#F59E0B' : '#4F46E5';
  const secondaryColor = isDark ? '#9CA3AF' : '#6B7280';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 22 },
        shadowRadius: 28,
        elevation: 16,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.16,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 24,
        elevation: 10,
      };

  return (
    <View
      className={`absolute left-4 right-4 bottom-6 border rounded-[24px] px-5 py-[18px] flex-row items-center ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}
      style={[
        {
          borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
        },
        shadowStyle,
      ]}
    >
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: 'rgba(99, 102, 241, 0.16)' }}
      >
        <Ionicons
          name={timerState === 'paused' ? 'pause-circle' : 'time-outline'}
          size={18}
          color={timerState === 'paused' ? secondaryColor : accentColor}
        />
      </View>

      <View className="flex-1">
        <Text
          className="text-[11px] uppercase font-semibold"
          style={{ color: secondaryColor, letterSpacing: 1.2 }}
        >
          {timerState === 'paused' ? 'Timer en pausa' : `Descanso — ${exerciseName}`}
        </Text>

        <View className="flex-row items-baseline mt-1.5">
          <Text
            className="text-[40px] font-extrabold"
            style={{
              color: timerState === 'paused' ? secondaryColor : accentColor,
              letterSpacing: -0.5,
            }}
          >
            {formatted}
          </Text>
          <Text
            className="text-sm font-semibold uppercase ml-2"
            style={{ color: secondaryColor, letterSpacing: 1.4 }}
          >
            seg
          </Text>
        </View>
      </View>

      {timerState === 'running' && onSkip ? (
        <TouchableOpacity
          onPress={onSkip}
          activeOpacity={0.75}
          className="px-4 py-2.5 rounded-2xl border ml-4"
          style={{ borderColor: accentColor }}
        >
          <Text
            className="text-[13px] font-bold uppercase"
            style={{ color: accentColor, letterSpacing: 1.1 }}
          >
            Omitir
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

