import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { formatDuration } from '@shared/utils';
import { ExecutionStatsCard } from '../components/ExecutionStatsCard';
import { Button } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  routineName: string;
  duration: number; // segundos
  totalVolume: number; // kg
  setsCompleted: number;
  totalSets: number;
  onTerminate: () => void;
};

export function ExecutionHeader({
  routineName,
  duration,
  totalVolume,
  setsCompleted,
  totalSets,
  onTerminate,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      title: isDark ? '#F9FAFB' : '#111827',
      subtitle: isDark ? '#9CA3AF' : '#6B7280',
      buttonBg: isDark ? '#6366F1' : '#4F46E5',
      buttonShadow: isDark ? 'rgba(99, 102, 241, 0.28)' : 'rgba(79, 70, 229, 0.32)',
    }),
    [isDark],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleStack}>
          <Text style={[styles.title, { color: palette.title }]} numberOfLines={2}>
            {routineName || 'Rutina en progreso'}
          </Text>
          <Text style={[styles.subtitle, { color: palette.subtitle }]}>
            Sesion en progreso
          </Text>
        </View>

        <Button
          onPress={onTerminate}
          size="sm"
          variant="primary"
          style={[
            styles.terminateButton,
            { backgroundColor: palette.buttonBg, shadowColor: palette.buttonShadow },
          ]}
        >
          Finalizar
        </Button>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ExecutionStatsCard
            label="Duracion"
            value={formatDuration(duration)}
            variant="accent"
            icon={<Ionicons name="time-outline" size={20} color="#6366F1" />}
          />
        </View>
        <View style={styles.statItem}>
          <ExecutionStatsCard
            label="Volumen"
            value={`${totalVolume.toFixed(0)}kg`}
            variant="default"
            icon={<Ionicons name="barbell-outline" size={20} color="#A78BFA" />}
          />
        </View>
        <View style={styles.statItemLast}>
          <ExecutionStatsCard
            label="Series"
            value={`${setsCompleted}/${totalSets}`}
            variant="success"
            icon={<Ionicons name="checkmark-done-outline" size={20} color="#34D399" />}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleStack: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  terminateButton: {
    minWidth: 116,
    elevation: 8,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    marginRight: 12,
  },
  statItemLast: {
    flex: 1,
    marginRight: 0,
  },
});




