import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SetExecution } from '@features/routines/domain/entities/ExecutionSession';
import { EditableSetRow } from './EditableSetRow';

type Props = {
  sets: SetExecution[];
  onUpdateSet: (setIndex: number, data: Partial<SetExecution>) => void;
  onAddSet: () => void;
  onMarkSetDone: (setIndex: number) => void;
};

/**
 * Tabla editable de series para un ejercicio
 * Headers: SERIE | ANTERIOR | KG | REPS | ✓
 */
export function ExerciseSetTable({
  sets,
  onUpdateSet,
  onAddSet,
  onMarkSetDone,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const backgroundColor = isDark ? '#1f2937' : '#f9fafb';

  return (
    <View className="mt-4 rounded-lg overflow-hidden">
      {/* Headers */}
      <View
        className="flex-row items-center py-2.5 px-2 border-b-2"
        style={{
          backgroundColor: `${backgroundColor}80`,
          borderBottomColor: borderColor,
        }}
      >
        {/* SERIE */}
        <View className="w-12 items-center">
          <Text
            className="text-xs font-bold uppercase"
            style={{ color: secondaryTextColor }}
          >
            SERIE
          </Text>
        </View>

        {/* ANTERIOR */}
        <View className="flex-1 items-center">
          <Text
            className="text-xs font-bold uppercase"
            style={{ color: secondaryTextColor }}
          >
            ANTERIOR
          </Text>
        </View>

        {/* KG */}
        <View className="flex-1 items-center">
          <Text
            className="text-xs font-bold uppercase"
            style={{ color: secondaryTextColor }}
          >
            KG
          </Text>
        </View>

        {/* REPS */}
        <View className="flex-1 items-center">
          <Text
            className="text-xs font-bold uppercase"
            style={{ color: secondaryTextColor }}
          >
            REPS
          </Text>
        </View>

        {/* Checkbox column */}
        <View className="w-10 items-center">
          <Text
            className="text-xs font-bold"
            style={{ color: secondaryTextColor }}
          >
            ✓
          </Text>
        </View>
      </View>

      {/* Rows */}
      {sets.length > 0 ? (
        sets.map((set, index) => (
          <EditableSetRow
            key={`set-${set.setNumber}`}
            set={set}
            onUpdate={(data) => onUpdateSet(index, data)}
            onMarkDone={() => onMarkSetDone(index)}
          />
        ))
      ) : (
        <View className="py-4 items-center justify-center">
          <Text className="text-sm" style={{ color: secondaryTextColor }}>
            No hay series agregadas
          </Text>
        </View>
      )}

      {/* Botón Agregar Serie */}
      <TouchableOpacity
        className="mt-3 py-2.5 px-3 rounded-lg border border-dashed items-center justify-center"
        style={{
          borderColor: secondaryTextColor,
        }}
        onPress={onAddSet}
        activeOpacity={0.6}
      >
        <Text
          className="text-sm font-semibold"
          style={{ color: secondaryTextColor }}
        >
          + Agregar Serie
        </Text>
      </TouchableOpacity>
    </View>
  );
}
