import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, ProgressSection } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

type Props = {
  completed: number;
  goal: number;
};

export default function RoutineProgress({ completed, goal }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
    }),
    [isDark],
  );

  const progressPct = Math.max(0, Math.min(100, (completed / Math.max(1, goal)) * 100));

  return (
    <View style={styles.wrapper}>
      <Card
        padding="none"
        style={[
          styles.card,
          {
            backgroundColor: palette.background,
            borderColor: palette.border,
          },
        ]}
      >
        <ProgressSection
          current={completed}
          goal={goal}
          progressPct={progressPct}
          label="Progreso semanal"
          description={`${completed}/${goal} entrenamientos`}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
});

