import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
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

  const palette = useMemo(
    () => ({
      screen: isDark ? '#0F172A' : '#F9FAFB',
      header: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(55, 65, 81, 0.7)' : '#E5E7EB',
      title: isDark ? '#F9FAFB' : '#111827',
      subtitle: isDark ? '#9CA3AF' : '#6B7280',
      card: isDark ? '#111827' : '#ffffff',
      cardBorder: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      primary: '#4F46E5',
      danger: '#EF4444',
    }),
    [isDark],
  );

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
      <View style={[styles.container, { backgroundColor: palette.screen }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: palette.header,
              borderBottomColor: palette.border,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: palette.title }]}>Seleccionar ejercicio</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={palette.title} />
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
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={palette.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={[styles.errorText, { color: palette.danger }]}>{error}</Text>
            <Button variant="primary" onPress={loadExercises} className="mt-6">
              Reintentar
            </Button>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id_exercise.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                activeOpacity={0.75}
                style={[
                  styles.card,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: palette.title }]}>
                  {item.exercise_name}
                </Text>
                <View style={styles.cardMeta}>
                  <Text style={[styles.metaText, { color: palette.subtitle }]}>
                    {item.muscular_group || 'Musculo sin definir'}
                  </Text>
                  {item.difficulty_level ? (
                  <Text style={[styles.metaDivider, { color: palette.subtitle }]}>-</Text>
                  ) : null}
                  {item.difficulty_level ? (
                    <Text style={[styles.metaText, { color: palette.subtitle }]}>
                      {item.difficulty_level}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search" size={28} color={palette.subtitle} />
                <Text style={[styles.emptyText, { color: palette.subtitle }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaDivider: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
