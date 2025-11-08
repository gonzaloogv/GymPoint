import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { TimerState } from '@features/routines/domain/entities/ExecutionSession';
import { formatDuration } from '@shared/utils';

type Props = {
  state: TimerState;
  onTimerComplete?: () => void;
  onSkip?: () => void;
};

export function RestTimer({ state, onTimerComplete, onSkip }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (state.type === 'active') {
      setSecondsLeft(state.seconds);
    }
  }, [state]);

  useEffect(() => {
    if (state.type !== 'active' || secondsLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          onTimerComplete?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state, secondsLeft, onTimerComplete]);

  if (state.type === 'idle') {
    return null;
  }

  if (state.type === 'initial') {
    return (
      <View
        className="border rounded-[24px] px-5 py-[18px] mx-4 mb-4 flex-row items-center gap-4"
        style={{
          backgroundColor: '#F59E0B1A',
          borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 20,
          elevation: 4,
        }}
      >
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <Ionicons name="flame" size={22} color="#F59E0B" />
        </View>
        <Text
          className="flex-1 text-[15px] font-semibold leading-[21px]"
          style={{ color: isDark ? '#F9FAFB' : '#111827' }}
        >
          {state.message}
        </Text>
      </View>
    );
  }

  if (state.type === 'active') {
    const warning = secondsLeft <= 5;
    const accentColor = warning ? '#F59E0B' : '#4F46E5';

    return (
      <View
        className={`border rounded-[24px] px-5 py-[18px] mx-4 mb-4 ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
        style={{
          borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 20,
          elevation: 4,
        }}
      >
        <View
          className="flex-row items-center justify-between pb-3 border-b"
          style={{ borderBottomColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB' }}
        >
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="timer-outline" size={18} color={accentColor} />
            <Text
              className="text-[13px] font-semibold uppercase"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.4 }}
            >
              Descanso - {state.exerciseName}
            </Text>
          </View>

          {onSkip ? (
            <TouchableOpacity
              onPress={onSkip}
              activeOpacity={0.7}
              className="px-3.5 py-2 rounded-[14px] border"
              style={{ borderColor: accentColor }}
            >
              <Text
                className="text-xs font-bold uppercase"
                style={{ color: accentColor, letterSpacing: 0.8 }}
              >
                Omitir
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="items-center pt-[18px]">
          <Text
            className="text-[42px] font-extrabold"
            style={{ color: accentColor, letterSpacing: -0.8 }}
          >
            {formatDuration(Math.max(0, secondsLeft))}
          </Text>
          <Text
            className="text-[13px] font-semibold uppercase mt-1.5"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
          >
            segundos
          </Text>
        </View>
      </View>
    );
  }

  if (state.type === 'completed') {
    return (
      <View
        className="border rounded-[24px] px-5 py-[18px] mx-4 mb-4 flex-row items-center gap-4"
        style={{
          backgroundColor: '#10B9811A',
          borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 20,
          elevation: 4,
        }}
      >
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <Ionicons name="checkmark-done" size={22} color="#10B981" />
        </View>
        <Text className="flex-1 text-[15px] font-semibold leading-[21px]" style={{ color: '#10B981' }}>
          {state.message}
        </Text>
      </View>
    );
  }

  return null;
}

