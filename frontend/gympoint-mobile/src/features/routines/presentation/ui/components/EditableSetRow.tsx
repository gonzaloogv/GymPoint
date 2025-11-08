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
};

export function EditableSetRow({ set, onUpdate, onMarkDone, borderColor }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      <View className="w-[52px] items-center justify-center py-3">
        <Text className="text-sm font-bold" style={{ color: textColor }}>
          {set.setNumber}
        </Text>
      </View>

      <View className="flex-[1.25] px-1.5 items-center">
        <Text className="text-xs font-medium leading-4" style={{ color: secondaryColor }}>
          {set.previousWeight && set.previousReps ? `${set.previousWeight}kg x ${set.previousReps}` : '-'}
        </Text>
      </View>

      <View className="flex-1 px-1.5">
        <TextInput
          className="rounded-[10px] border py-2 px-2.5 text-center text-[13px] font-semibold leading-4"
          style={{
            borderColor: isEditable ? borderColor : 'transparent',
            backgroundColor: inputBg,
            color: textColor,
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

      <View className="flex-1 px-1.5">
        <TextInput
          className="rounded-[10px] border py-2 px-2.5 text-center text-[13px] font-semibold leading-4"
          style={{
            borderColor: isEditable ? borderColor : 'transparent',
            backgroundColor: inputBg,
            color: textColor,
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
        className="w-[68px] items-center justify-center"
        onPress={handleCheckbox}
        disabled={set.isDone}
        activeOpacity={0.6}
      >
        <View
          className="w-5 h-5 rounded-[10px] border-2 items-center justify-center"
          style={{
            borderColor: set.isDone ? successColor : secondaryColor,
            backgroundColor: set.isDone ? successColor : 'transparent',
          }}
        >
          {set.isDone ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}
