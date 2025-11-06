import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { MetricTile } from '@shared/components/ui';

type Props = {
  current: number;
  goal: number;
  progressPct: number; // 0..100
  streak: number;
  onStats?: () => void;
};

export default function WeeklyProgressCard({
  current,
  goal,
  progressPct,
  streak,
  onStats,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      iconColor: isDark ? '#C7D2FE' : '#4338CA',
      label: isDark ? '#9CA3AF' : '#6B7280',
      chipBg: isDark ? 'rgba(37, 99, 235, 0.16)' : 'rgba(59, 130, 246, 0.14)',
      chipBorder: isDark ? 'rgba(96, 165, 250, 0.32)' : 'rgba(59, 130, 246, 0.22)',
      chipText: isDark ? '#93C5FD' : '#1D4ED8',
      successBg: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.16)',
      successBorder: isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.2)',
      successText: isDark ? '#6EE7B7' : '#047857',
      valuePrimary: isDark ? '#F9FAFB' : '#111827',
      valueSecondary: isDark ? '#C7D2FE' : '#4338CA',
      valueTertiary: isDark ? '#9CA3AF' : '#6B7280',
    }),
    [isDark],
  );

  const roundedProgress = Math.round(progressPct);

  return (
    <MetricTile
      tone="primary"
      highlight
      valueContent={
        <View style={styles.inlineRow}>
          <View style={styles.inlineIcon}>
            <Ionicons name="target" size={24} color={palette.iconColor} />
          </View>
          <View style={styles.inlineContent}>
            <Text style={[styles.inlineLabel, { color: palette.label }]}>Meta semanal</Text>
            <Text style={[styles.inlineValue, { color: palette.valuePrimary }]}>
              {current}
              <Text style={[styles.inlineValueSecondary, { color: palette.valueSecondary }]}>{` de ${goal}`}</Text>
              <Text style={[styles.inlineValueTertiary, { color: palette.valueTertiary }]}>
                {' entrenamientos'}
              </Text>
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.chipsRow}>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: palette.successBg,
              borderColor: palette.successBorder,
            },
          ]}
        >
          <Ionicons name="flame" size={16} color={palette.successText} />
          <Text style={[styles.chipText, { color: palette.successText }]}>Racha {streak}</Text>
        </View>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: palette.chipBg,
              borderColor: palette.chipBorder,
            },
          ]}
        >
          <Ionicons name="trending-up" size={16} color={palette.chipText} />
          <Text style={[styles.chipText, { color: palette.chipText }]}>{roundedProgress}% logrado</Text>
        </View>
      </View>
    </MetricTile>
  );
}

const styles = StyleSheet.create({
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    backgroundColor: 'rgba(129, 140, 248, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineContent: {
    marginLeft: 16,
    flex: 1,
  },
  inlineLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  inlineValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '700',
  },
  inlineValueSecondary: {
    fontSize: 16,
    fontWeight: '700',
  },
  inlineValueTertiary: {
    fontSize: 16,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: -8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 12,
    marginBottom: 8,
  },
  chipText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
});
