import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = {
  routineName: string;
  sessionsCount: number;
  loading?: boolean;
};

export function HistoryHeader({ routineName, sessionsCount, loading = false }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const primary = isDark ? '#F9FAFB' : '#111827';
  const secondary = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: primary }]}>Historial</Text>
      <Text style={[styles.subtitle, { color: secondary }]}>{routineName}</Text>
      {loading ? (
        <View style={styles.sessionRow}>
          <ActivityIndicator size="small" color={secondary} />
        </View>
      ) : (
        <Text style={[styles.meta, { color: secondary }]}>
          {sessionsCount} sesiones registradas
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sessionRow: {
    paddingVertical: 4,
  },
});
