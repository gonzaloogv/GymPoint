import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { SetExecution } from '@features/routines/domain/entities/ExecutionSession';
import { EditableSetRow } from './EditableSetRow';

type Props = {
  sets: SetExecution[];
  onUpdateSet: (setIndex: number, data: Partial<SetExecution>) => void;
  onAddSet: () => void;
  onMarkSetDone: (setIndex: number) => void;
};

export function ExerciseSetTable({
  sets,
  onUpdateSet,
  onAddSet,
  onMarkSetDone,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const headerBg = isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(248, 250, 252, 0.9)';
  const headerText = isDark ? '#9CA3AF' : '#6B7280';
  const dividerColor = isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(148, 163, 184, 0.35)';
  const accentColor = isDark ? '#6366F1' : '#4F46E5';

  return (
    <View className="rounded-2xl overflow-hidden border" style={{ borderColor: dividerColor }}>
      <View
        className="flex-row items-center py-3.5 px-3 border-b"
        style={{
          backgroundColor: headerBg,
          borderBottomColor: dividerColor,
        }}
      >
        <Text
          className="w-[52px] text-[11px] font-bold uppercase text-center leading-4"
          style={{ color: headerText, letterSpacing: 0.5 }}
        >
          Serie
        </Text>
        <Text
          className="flex-[1.25] px-1 text-[11px] font-bold uppercase text-center leading-4"
          style={{ color: headerText, letterSpacing: 0.5 }}
        >
          Anterior
        </Text>
        <Text
          className="flex-1 text-[11px] font-bold uppercase text-center leading-4"
          style={{ color: headerText, letterSpacing: 0.5 }}
        >
          Kg
        </Text>
        <Text
          className="flex-1 text-[11px] font-bold uppercase text-center leading-4"
          style={{ color: headerText, letterSpacing: 0.5 }}
        >
          Reps
        </Text>
        <Text
          className="w-[68px] text-[11px] font-bold uppercase text-center leading-4"
          style={{ color: headerText, letterSpacing: 0.5 }}
        >
          Hecha
        </Text>
      </View>

      {sets.length ? (
        sets.map((set, index) => (
          <EditableSetRow
            key={`set-${set.setNumber}`}
            set={set}
            onUpdate={(data) => onUpdateSet(index, data)}
            onMarkDone={() => onMarkSetDone(index)}
            borderColor={dividerColor}
          />
        ))
      ) : (
        <View className="py-6 items-center gap-2">
          <Ionicons name="cube-outline" size={20} color={headerText} />
          <Text className="text-[13px] font-medium" style={{ color: headerText }}>
            No hay series agregadas
          </Text>
        </View>
      )}

      <TouchableOpacity
        className="flex-row items-center justify-center gap-2.5 py-3.5 border-t"
        style={{ borderTopColor: dividerColor }}
        onPress={onAddSet}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle" size={18} color={accentColor} />
        <Text className="text-sm font-bold" style={{ color: accentColor, letterSpacing: 0.5 }}>
          Agregar serie
        </Text>
      </TouchableOpacity>
    </View>
  );
}
