import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { SetExecution } from '@features/routines/domain/entities/ExecutionSession';

type Props = {
  set: SetExecution;
  onUpdate: (data: Partial<SetExecution>) => void;
  onMarkDone: () => void;
  borderColor: string;
  columnWidths?: {
    set: number;
    previous: number;
    weight: number;
    reps: number;
    done: number;
  };
};

export function EditableSetRow({ set, onUpdate, onMarkDone, borderColor, columnWidths }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const widths = columnWidths ?? {
    set: 35,
    previous: 50,
    weight: 70,
    reps: 70,
    done: 50,
  };

  const textColor = isDark ? '#F9FAFB' : '#111827';
  const secondaryColor = isDark ? '#9CA3AF' : '#6B7280';
  const inputBg = isDark ? '#0F172A' : '#FFFFFF';
  const successColor = '#10B981';

  const handleWeightChange = (text: string) => {
    const value = parseFloat(text);
    if (text === '' || !isNaN(value)) {
      onUpdate({ currentWeight: isNaN(value) ? 0 : value });
    }
  };

  const handleRepsChange = (text: string) => {
    const value = parseInt(text, 10);
    if (text === '' || (!isNaN(value) && value > 0)) {
      onUpdate({ currentReps: isNaN(value) ? 0 : value });
    }
  };

  const handleCheckbox = () => {
    if (
      set.currentWeight === null ||
      set.currentWeight === undefined ||
      set.currentWeight < 0 ||
      !set.currentReps ||
      set.currentReps <= 0
    ) {
      Alert.alert(
        'Datos incompletos',
        'Completa peso (0kg valido) y repeticiones (>0) antes de marcar la serie como hecha.',
      );
      return;
    }

    onMarkDone();
  };

  const isEditable = !set.isDone;

  return (
    <View
      className="flex-row items-center border-b"
      style={{
        backgroundColor: set.isDone ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
        borderBottomColor: borderColor,
      }}
    >
      <View
        className="items-center justify-center py-2 pl-1"
        style={{ width: widths.set }}
      >
        <Text className="text-sm font-bold" style={{ color: textColor }}>
          {set.setNumber}
        </Text>
      </View>

      <View
        className="items-center justify-center pl-1"
        style={{ width: widths.previous }}
      >
        {set.previousWeight && set.previousReps ? (
          <View className="items-center">
            <Text className="text-[10px] font-semibold leading-3" style={{ color: secondaryColor }}>
              {set.previousWeight}
            </Text>
            <Text className="text-[9px] font-medium leading-3 mt-0.5" style={{ color: secondaryColor, opacity: 0.7 }}>
              ×{set.previousReps}
            </Text>
          </View>
        ) : (
          <Text className="text-[11px] font-medium" style={{ color: secondaryColor }}>
            -
          </Text>
        )}
      </View>

      <View className="items-center justify-center pl-1.5" style={{ width: widths.weight }}>
        <TextInput
          className="rounded border py-1 px-1.5 text-center text-sm font-semibold"
          style={{
            borderColor: isEditable ? borderColor : 'transparent',
            backgroundColor: inputBg,
            color: textColor,
            width: 58,
            height: 32,
          }}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={secondaryColor}
          value={set.currentWeight ? String(set.currentWeight) : ''}
          onChangeText={handleWeightChange}
          editable={isEditable}
          maxLength={5}
        />
      </View>

      <View className="items-center justify-center pl-1.5" style={{ width: widths.reps }}>
        <TextInput
          className="rounded border py-1 px-1.5 text-center text-sm font-semibold"
          style={{
            borderColor: isEditable ? borderColor : 'transparent',
            backgroundColor: inputBg,
            color: textColor,
            width: 58,
            height: 32,
          }}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={secondaryColor}
          value={set.currentReps ? String(set.currentReps) : ''}
          onChangeText={handleRepsChange}
          editable={isEditable}
          maxLength={3}
        />
      </View>

      <TouchableOpacity
        className="items-center justify-center pl-1"
        style={{ width: widths.done }}
        onPress={handleCheckbox}
        disabled={set.isDone}
        activeOpacity={0.6}
      >
        <View
          className="w-6 h-6 rounded-full border-2 items-center justify-center"
          style={{
            borderColor: set.isDone ? successColor : secondaryColor,
            backgroundColor: set.isDone ? successColor : 'transparent',
          }}
        >
          {set.isDone ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}
