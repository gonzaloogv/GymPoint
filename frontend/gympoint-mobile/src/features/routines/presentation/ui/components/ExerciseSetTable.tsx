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
  const columnWidths = {
    set: 35,
    previous: 50,
    weight: 70,
    reps: 70,
    done: 50,
  };

  return (
    <View className="rounded-2xl overflow-hidden border" style={{ borderColor: dividerColor }}>
      <View
        className="flex-row items-center py-2 px-2 border-b"
        style={{
          backgroundColor: headerBg,
          borderBottomColor: dividerColor,
        }}
      >
        <View style={{ width: columnWidths.set }} className="items-center justify-center">
          <Text
            className="text-[9px] font-bold uppercase leading-3 text-center"
            style={{ color: headerText, letterSpacing: 0.5 }}
          >
            #
          </Text>
        </View>
        <View style={{ width: columnWidths.previous }} className="items-center justify-center">
          <Text
            className="text-[9px] font-bold uppercase leading-3 text-center"
            style={{ color: headerText, letterSpacing: 0.5 }}
          >
            PREV
          </Text>
        </View>
        <View style={{ width: columnWidths.weight }} className="items-center justify-center">
          <Text
            className="text-[9px] font-bold uppercase leading-3 text-center"
            style={{ color: headerText, letterSpacing: 0.5 }}
          >
            KG
          </Text>
        </View>
        <View style={{ width: columnWidths.reps }} className="items-center justify-center">
          <Text
            className="text-[9px] font-bold uppercase leading-3 text-center"
            style={{ color: headerText, letterSpacing: 0.5 }}
          >
            REPS
          </Text>
        </View>
        <View style={{ width: columnWidths.done }} className="items-center justify-center">
          <View
            className="w-6 h-6 rounded-full border-2 items-center justify-center"
            style={{ borderColor: headerText }}
          >
            <Ionicons name="checkmark" size={14} color={headerText} />
          </View>
        </View>
      </View>

      {sets.length ? (
        sets.map((set, index) => (
          <EditableSetRow
            key={`set-${set.setNumber}`}
            set={set}
            onUpdate={(data) => onUpdateSet(index, data)}
            onMarkDone={() => onMarkSetDone(index)}
            borderColor={dividerColor}
            columnWidths={columnWidths}
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
        className="flex-row items-center justify-center gap-2 py-3 border-t"
        style={{ borderTopColor: dividerColor }}
        onPress={onAddSet}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle" size={16} color={accentColor} />
        <Text className="text-[13px] font-bold" style={{ color: accentColor, letterSpacing: 0.3 }}>
          Agregar serie
        </Text>
      </TouchableOpacity>
    </View>
  );
}
