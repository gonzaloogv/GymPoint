import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SetExecution } from '@features/routines/domain/entities/ExecutionSession';

type Props = {
  set: SetExecution;
  onUpdate: (data: Partial<SetExecution>) => void;
  onMarkDone: () => void;
};

/**
 * Fila editable de una serie en la tabla de ejercicios
 * Permite editar peso y reps, y marcar como completada
 */
export function EditableSetRow({ set, onUpdate, onMarkDone }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos basados en tema
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const backgroundColor = isDark ? '#1f2937' : '#f9fafb';
  const inputBgColor = isDark ? '#111827' : '#ffffff';

  const handleWeightChange = (text: string) => {
    const value = parseFloat(text);
    // Permitir solo números positivos con máximo 2 decimales
    if (text === '' || !isNaN(value)) {
      onUpdate({ currentWeight: isNaN(value) ? 0 : value });
    }
  };

  const handleRepsChange = (text: string) => {
    const value = parseInt(text, 10);
    // Permitir solo enteros positivos
    if (text === '' || (!isNaN(value) && value > 0)) {
      onUpdate({ currentReps: isNaN(value) ? 0 : value });
    }
  };

  const handleCheckbox = () => {
    // Validar que peso y reps estén completados
    if (!set.currentWeight || set.currentWeight <= 0 || !set.currentReps || set.currentReps <= 0) {
      Alert.alert(
        'Datos incompletos',
        'Por favor completa el peso y las repeticiones antes de marcar esta serie como hecha.'
      );
      return;
    }

    onMarkDone();
  };

  // No permitir editar si ya está marcado como done
  const isEditable = !set.isDone;

  return (
    <View
      className="flex-row items-center py-3 px-2 rounded-lg"
      style={{
        backgroundColor: set.isDone ? `${backgroundColor}80` : backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
      }}
    >
      {/* Número de serie */}
      <View className="w-12 items-center justify-center">
        <Text className="font-semibold" style={{ color: textColor, fontSize: 14 }}>
          {set.setNumber}
        </Text>
      </View>

      {/* Valores previos (no editables) */}
      <View className="flex-1 items-center justify-center px-2">
        <Text className="text-xs" style={{ color: secondaryTextColor }}>
          {set.previousWeight && set.previousReps
            ? `${set.previousWeight}kg × ${set.previousReps}`
            : '-'}
        </Text>
      </View>

      {/* Input: Peso (KG) */}
      <View className="flex-1 items-center px-1">
        <TextInput
          className="w-full text-center border rounded px-2 py-1.5"
          style={{
            borderColor: isEditable ? borderColor : `${borderColor}50`,
            backgroundColor: inputBgColor,
            color: textColor,
            fontSize: 12,
          }}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={secondaryTextColor}
          value={set.currentWeight ? String(set.currentWeight) : ''}
          onChangeText={handleWeightChange}
          editable={isEditable}
          maxLength={5}
        />
      </View>

      {/* Input: Reps */}
      <View className="flex-1 items-center px-1">
        <TextInput
          className="w-full text-center border rounded px-2 py-1.5"
          style={{
            borderColor: isEditable ? borderColor : `${borderColor}50`,
            backgroundColor: inputBgColor,
            color: textColor,
            fontSize: 12,
          }}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={secondaryTextColor}
          value={set.currentReps ? String(set.currentReps) : ''}
          onChangeText={handleRepsChange}
          editable={isEditable}
          maxLength={3}
        />
      </View>

      {/* Checkbox / Checkmark */}
      <TouchableOpacity
        className="w-10 items-center justify-center"
        onPress={handleCheckbox}
        disabled={set.isDone}
        activeOpacity={0.6}
      >
        <View
          className="w-5 h-5 rounded border-2 items-center justify-center"
          style={{
            borderColor: set.isDone ? '#10b981' : borderColor,
            backgroundColor: set.isDone ? '#10b981' : 'transparent',
          }}
        >
          {set.isDone && (
            <Text className="text-white font-bold text-xs">✓</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
