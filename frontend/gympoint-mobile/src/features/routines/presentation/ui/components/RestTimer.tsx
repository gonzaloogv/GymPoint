import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  const palette = useMemo(
    () => ({
      card: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      heading: isDark ? '#F9FAFB' : '#111827',
      subtext: isDark ? '#9CA3AF' : '#6B7280',
      accent: '#4F46E5',
      warning: '#F59E0B',
      success: '#10B981',
    }),
    [isDark],
  );

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
        style={[
          styles.container,
          styles.banner,
          {
            backgroundColor: `${palette.warning}1A`,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.bannerIcon}>
          <Ionicons name="flame" size={22} color={palette.warning} />
        </View>
        <Text style={[styles.bannerText, { color: palette.heading }]}>{state.message}</Text>
      </View>
    );
  }

  if (state.type === 'active') {
    const warning = secondsLeft <= 5;
    const accentColor = warning ? palette.warning : palette.accent;

    return (
      <View
        style={[
          styles.container,
          {
            borderColor: palette.border,
            backgroundColor: palette.card,
          },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: palette.border }]}>
          <View style={styles.row}>
            <Ionicons name="timer-outline" size={18} color={accentColor} />
            <Text style={[styles.headerLabel, { color: palette.subtext }]}>
              Descanso - {state.exerciseName}
            </Text>
          </View>

          {onSkip ? (
            <TouchableOpacity
              onPress={onSkip}
              activeOpacity={0.7}
              style={[styles.skipButton, { borderColor: accentColor }]}
            >
              <Text style={[styles.skipText, { color: accentColor }]}>Omitir</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.timerBlock}>
          <Text style={[styles.timerValue, { color: accentColor }]}>
            {formatDuration(Math.max(0, secondsLeft))}
          </Text>
          <Text style={[styles.timerSuffix, { color: palette.subtext }]}>segundos</Text>
        </View>
      </View>
    );
  }

  if (state.type === 'completed') {
    return (
      <View
        style={[
          styles.container,
          styles.banner,
          {
            backgroundColor: `${palette.success}1A`,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.bannerIcon}>
          <Ionicons name="checkmark-done" size={22} color={palette.success} />
        </View>
        <Text style={[styles.bannerText, { color: palette.success }]}>{state.message}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  timerBlock: {
    alignItems: 'center',
    paddingTop: 18,
  },
  timerValue: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  timerSuffix: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 6,
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
});

