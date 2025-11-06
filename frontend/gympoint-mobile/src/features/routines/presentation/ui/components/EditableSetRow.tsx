import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
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

  const palette = useMemo(
    () => ({
      text: isDark ? '#F9FAFB' : '#111827',
      secondary: isDark ? '#9CA3AF' : '#6B7280',
      inputBg: isDark ? '#0F172A' : '#FFFFFF',
      success: '#10B981',
    }),
    [isDark],
  );

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
      style={[
        styles.row,
        {
          backgroundColor: set.isDone ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
          borderBottomColor: borderColor,
        },
      ]}
    >
      <View style={styles.seriesCell}>
        <Text style={[styles.seriesLabel, { color: palette.text }]}>{set.setNumber}</Text>
      </View>

      <View style={styles.previousCell}>
        <Text style={[styles.previousText, { color: palette.secondary }]}>
          {set.previousWeight && set.previousReps ? `${set.previousWeight}kg x ${set.previousReps}` : '-'}
        </Text>
      </View>

      <View style={styles.inputCell}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: isEditable ? borderColor : 'transparent',
              backgroundColor: palette.inputBg,
              color: palette.text,
            },
          ]}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={palette.secondary}
          value={set.currentWeight ? String(set.currentWeight) : ''}
          onChangeText={handleWeightChange}
          editable={isEditable}
          maxLength={5}
        />
      </View>

      <View style={styles.inputCell}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: isEditable ? borderColor : 'transparent',
              backgroundColor: palette.inputBg,
              color: palette.text,
            },
          ]}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={palette.secondary}
          value={set.currentReps ? String(set.currentReps) : ''}
          onChangeText={handleRepsChange}
          editable={isEditable}
          maxLength={3}
        />
      </View>

      <TouchableOpacity
        style={styles.toggleCell}
        onPress={handleCheckbox}
        disabled={set.isDone}
        activeOpacity={0.6}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: set.isDone ? palette.success : palette.secondary,
              backgroundColor: set.isDone ? palette.success : 'transparent',
            },
          ]}
        >
          {set.isDone ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  seriesCell: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  seriesLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  previousCell: {
    flex: 1.25,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  previousText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  inputCell: {
    flex: 1,
    paddingHorizontal: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  toggleCell: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
