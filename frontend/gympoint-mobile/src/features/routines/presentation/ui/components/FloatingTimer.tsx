import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
      secondary: isDark ? '#9CA3AF' : '#6B7280',
      primary: '#4F46E5',
      warning: '#F59E0B',
      success: '#10B981',
      text: isDark ? '#F9FAFB' : '#111827',
    }),
    [isDark],
  );

  if (timerState === 'idle') {
    return null;
  }

  const seconds = Math.max(0, restSeconds);
  const formatted = formatDuration(seconds);
  const isWarning = seconds <= 5 && timerState === 'running';
  const accentColor = isWarning ? palette.warning : palette.primary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        isDark ? styles.darkShadow : styles.lightShadow,
      ]}
    >
      <View style={styles.iconBubble}>
        <Ionicons
          name={timerState === 'paused' ? 'pause-circle' : 'time-outline'}
          size={18}
          color={timerState === 'paused' ? palette.secondary : accentColor}
        />
      </View>

      <View style={styles.textColumn}>
        <Text style={[styles.badge, { color: palette.secondary }]}>
          {timerState === 'paused' ? 'Timer en pausa' : `Descanso — ${exerciseName}`}
        </Text>

        <View style={styles.timerRow}>
          <Text
            style={[
              styles.timerValue,
              { color: timerState === 'paused' ? palette.secondary : accentColor },
            ]}
          >
            {formatted}
          </Text>
          <Text style={[styles.timerSuffix, { color: palette.secondary }]}>seg</Text>
        </View>
      </View>

      {timerState === 'running' && onSkip ? (
        <TouchableOpacity
          onPress={onSkip}
          activeOpacity={0.75}
          style={[styles.skipButton, { borderColor: accentColor }]}
        >
          <Text style={[styles.skipText, { color: accentColor }]}>Omitir</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lightShadow: {
    shadowColor: '#4338CA',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 24,
    elevation: 10,
  },
  darkShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 22 },
    shadowRadius: 28,
    elevation: 16,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.16)',
    marginRight: 16,
  },
  textColumn: {
    flex: 1,
  },
  badge: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  timerValue: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  timerSuffix: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginLeft: 8,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 16,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
});

