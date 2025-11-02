import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button, ButtonText } from '@shared/components/ui';

type Props = {
  onAddExercise?: () => void;
  onDiscardWorkout: () => void;
};

/**
 * Footer para pantalla de ejecución
 * Muestra botones para agregar ejercicio y descartar entrenamiento
 */
export function ExecutionFooter({
  onAddExercise,
  onDiscardWorkout,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const bgColor = isDark ? '#111827' : '#f9fafb';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const handleDiscard = () => {
    Alert.alert(
      'Descartar entrenamiento',
      '¿Estás seguro que deseas descartar este entrenamiento? Se perderá todo el progreso.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: onDiscardWorkout,
        },
      ]
    );
  };

  return (
    <View className="p-4 gap-3" style={{ backgroundColor: bgColor }}>
      {/* Botón Agregar Ejercicio (opcional) */}
      {onAddExercise && (
        <Button onPress={onAddExercise} className="w-full">
          <ButtonText>+ Agregar Ejercicio</ButtonText>
        </Button>
      )}

      {/* Botón Descartar Entrenamiento */}
      <TouchableOpacity
        onPress={handleDiscard}
        className="py-3 px-4 rounded-lg border items-center justify-center"
        style={{
          borderColor: '#ef4444',
        }}
        activeOpacity={0.6}
      >
        <Text
          className="font-semibold"
          style={{ color: '#ef4444' }}
        >
          Descartar Entrenamiento
        </Text>
      </TouchableOpacity>
    </View>
  );
}
