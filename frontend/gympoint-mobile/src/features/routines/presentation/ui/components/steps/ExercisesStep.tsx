import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Feather } from '@expo/vector-icons';
import {
  StepScrollContainer,
  StepSection,
  Button,
  Input,
} from '@shared/components/ui';
import { Exercise } from '@features/routines/domain/entities/Exercise';

type Props = {
  exercises: Exercise[];
  onChange: (exercises: Exercise[]) => void;
};

export function ExercisesStep({ exercises, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const addExercise = () => {
    const newExercise: Exercise = {
      id: `temp-${Date.now()}`,
      name: '',
      sets: '',
      reps: '',
      rest: 60,
      muscleGroups: [],
    };
    onChange([...exercises, newExercise]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    onChange(
      exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
    );
  };

  const removeExercise = (id: string) => {
    onChange(exercises.filter((ex) => ex.id !== id));
  };

  return (
    <StepScrollContainer>
      <StepSection>
        <Text className="text-sm font-semibold mb-4" style={{ color: textColor }}>
          Ejercicios de la rutina
        </Text>
        {exercises.length === 0 && (
          <Text className="text-center text-sm" style={{ color: subtextColor, marginVertical: 32, lineHeight: 20 }}>
            No hay ejercicios.{'\n'}Presiona el botón + para agregar.
          </Text>
        )}
        {exercises.map((exercise, index) => (
          <View
            key={exercise.id}
            className="rounded-lg p-5 mb-4 border"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
              borderWidth: 1,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-semibold flex-1" style={{ color: textColor }}>
                Ejercicio {index + 1}
              </Text>
              <TouchableOpacity onPress={() => removeExercise(exercise.id)} className="p-1">
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <View className="mb-3">
              <Text className="text-xs font-medium mb-1.5" style={{ color: subtextColor }}>
                Nombre
              </Text>
              <Input
                value={exercise.name}
                onChangeText={(v) => updateExercise(exercise.id, 'name', v)}
                placeholder="Ej: Press de banca"
              />
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-medium mb-1.5" style={{ color: subtextColor }}>
                  Series
                </Text>
                <Input
                  value={String(exercise.sets)}
                  onChangeText={(v) => updateExercise(exercise.id, 'sets', v)}
                  placeholder="3"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium mb-1.5" style={{ color: subtextColor }}>
                  Reps
                </Text>
                <Input
                  value={exercise.reps}
                  onChangeText={(v) => updateExercise(exercise.id, 'reps', v)}
                  placeholder="10-12"
                />
              </View>
            </View>
          </View>
        ))}
      </StepSection>
      <Button onPress={addExercise} variant="primary" className="flex-row items-center gap-2 mt-1">
        <Feather name="plus" size={20} color="#fff" />
        <Text className="text-white font-semibold text-sm">Agregar ejercicio</Text>
      </Button>
    </StepScrollContainer>
  );
}
