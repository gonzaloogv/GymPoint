import React from 'react';
import { View, Alert } from 'react-native';
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
      className={`pt-6 pb-12 border-t ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      style={{
        borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
      }}
    >
      {onAddExercise ? (
        <Button
          onPress={onAddExercise}
          variant="primary"
          fullWidth
          icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
          className="mb-4"
        >
          Agregar ejercicio
        </Button>
      ) : null}

      <Button
        onPress={handleDiscard}
        variant="danger"
        fullWidth
        style={{
          shadowColor: 'rgba(239, 68, 68, 0.28)',
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 20,
          elevation: 5,
        }}
      >
        Descartar entrenamiento
      </Button>
    </View>
  );
}
