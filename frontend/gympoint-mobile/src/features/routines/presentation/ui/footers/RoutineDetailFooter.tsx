import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button, ButtonText } from '@shared/components/ui';

type Props = {
  onStartRoutine: () => void;
  onViewHistory: () => void;
};

export function RoutineDetailFooter({ onStartRoutine, onViewHistory }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#F9FAFB',
      border: isDark ? 'rgba(55, 65, 81, 0.6)' : '#E5E7EB',
    }),
    [isDark],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderTopColor: palette.border,
        },
      ]}
    >
      <Button fullWidth onPress={onStartRoutine}>
        <ButtonText>Empezar rutina</ButtonText>
      </Button>
      <Button fullWidth variant="secondary" onPress={onViewHistory}>
        <ButtonText>Ver historial</ButtonText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
  },
});
