import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Input, Button } from '@shared/components/ui';
import { exerciseApi, ExerciseDTO } from '../../../../data/remote/exercise.api';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseDTO) => void;
};

export function ExerciseSelectorModal({ visible, onClose, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const screen = isDark ? '#0F172A' : '#F9FAFB';
  const header = isDark ? '#111827' : '#ffffff';
  const border = isDark ? 'rgba(55, 65, 81, 0.7)' : '#E5E7EB';
  const title = isDark ? '#F9FAFB' : '#111827';
  const subtitle = isDark ? '#9CA3AF' : '#6B7280';
  const card = isDark ? '#111827' : '#ffffff';
  const cardBorder = isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';
  const primary = '#4F46E5';
  const danger = '#EF4444';

  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadExercises();
    }
  }, [visible]);

  const loadExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await exerciseApi.getAll();
      setExercises(data);
    } catch {
      setError('No pudimos cargar los ejercicios. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((exercise) =>
    exercise.exercise_name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (exercise: ExerciseDTO) => {
    onSelect(exercise);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: screen }}>
        <View
          className="pt-[52px] px-5 pb-5 border-b"
          style={{ backgroundColor: header, borderBottomColor: border }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold" style={{ color: title }}>
              Seleccionar ejercicio
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-1.5 rounded-2xl"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color={title} />
            </TouchableOpacity>
          </View>

          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre o musculo"
            autoCapitalize="none"
            className="mt-4"
          />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text
              className="text-[15px] text-center leading-[22px]"
              style={{ color: danger }}
            >
              {error}
            </Text>
            <Button variant="primary" onPress={loadExercises} className="mt-6">
              Reintentar
            </Button>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id_exercise.toString()}
            contentContainerClassName="px-5 py-6"
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                activeOpacity={0.75}
                className="border rounded-[18px] px-[18px] py-4 mb-3.5"
                style={{ backgroundColor: card, borderColor: cardBorder }}
              >
                <Text className="text-base font-bold" style={{ color: title }}>
                  {item.exercise_name}
                </Text>
                <View className="flex-row items-center flex-wrap gap-1.5">
                  <Text className="text-[13px] font-medium" style={{ color: subtitle }}>
                    {item.muscular_group || 'Musculo sin definir'}
                  </Text>
                  {item.difficulty_level ? (
                    <Text className="text-xs font-bold" style={{ color: subtitle }}>
                      -
                    </Text>
                  ) : null}
                  {item.difficulty_level ? (
                    <Text className="text-[13px] font-medium" style={{ color: subtitle }}>
                      {item.difficulty_level}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-12 gap-3">
                <Ionicons name="search" size={28} color={subtitle} />
                <Text
                  className="text-sm text-center leading-5"
                  style={{ color: subtitle }}
                >
                  No encontramos ejercicios con ese criterio.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}
