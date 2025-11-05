import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useTheme } from '@shared/hooks';
import { Feather } from '@expo/vector-icons';
import { exerciseApi, ExerciseDTO } from '../../../../data/remote/exercise.api';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseDTO) => void;
};

export function ExerciseSelectorModal({ visible, onClose, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#111827' : '#f9fafb';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

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
      console.log('✅ Loaded exercises:', data.length);
    } catch (err: any) {
      console.error('❌ Error loading exercises:', err);
      setError('Error al cargar ejercicios');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.exercise_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (exercise: ExerciseDTO) => {
    console.log('✅ Selected exercise:', exercise);
    onSelect(exercise);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: cardBg,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            paddingTop: 50,
            paddingBottom: 16,
            paddingHorizontal: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>
              Seleccionar Ejercicio
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Feather name="x" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={{ marginTop: 16 }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar ejercicio..."
              placeholderTextColor={subtextColor}
              style={{
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: textColor,
              }}
            />
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#EF4444', fontSize: 16, textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity
              onPress={loadExercises}
              style={{
                marginTop: 16,
                backgroundColor: '#3B82F6',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id_exercise.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: borderColor,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 4 }}>
                  {item.exercise_name}
                </Text>
                <Text style={{ fontSize: 14, color: subtextColor }}>
                  {item.muscular_group}
                  {item.difficulty_level && ` • ${item.difficulty_level}`}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ paddingVertical: 40 }}>
                <Text style={{ textAlign: 'center', color: subtextColor }}>
                  No se encontraron ejercicios
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}
