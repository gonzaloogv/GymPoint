import React, { useMemo } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onAddExercise?: () => void;
  onDiscardWorkout: () => void;
};

export function ExecutionFooter({ onAddExercise, onDiscardWorkout }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
    }),
    [isDark],
  );

  const handleDiscard = () => {
    Alert.alert(
      'Descartar entrenamiento',
      '¿Estás seguro de que deseas descartar este entrenamiento? Perderás el progreso registrado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: onDiscardWorkout,
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.background, borderColor: palette.border },
      ]}
    >
      {onAddExercise ? (
        <Button
          onPress={onAddExercise}
          variant="primary"
          fullWidth
          icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
          style={styles.addButton}
        >
          Agregar ejercicio
        </Button>
      ) : null}

      <Button
        onPress={handleDiscard}
        variant="danger"
        fullWidth
        style={styles.discardButton}
      >
        Descartar entrenamiento
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 48,
    borderTopWidth: 1,
  },
  addButton: {
    marginBottom: 16,
  },
  discardButton: {
    shadowColor: 'rgba(239, 68, 68, 0.28)',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 5,
  },
});
