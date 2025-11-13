import { useState, useEffect } from 'react';
import { Alert, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@shared/hooks';

import { Screen } from '@shared/components/ui';
import { ScreenHeader } from '../components/ScreenHeader';
import { ImportTabHeader } from '../components/ImportTabHeader';
import { ImportRoutineList } from '../components/ImportRoutineList';
import { PredesignedRoutine } from '@features/routines/domain/entities/PredesignedRoutine';
import { Routine, DIFFICULTY_OPTIONS } from '@features/routines/domain/entities/Routine';
import { RoutinesStackParamList } from '@presentation/navigation/types';
import { routineRepository } from '@features/routines/data/RoutineRepositoryImpl';

type NavigationProp = NativeStackNavigationProp<RoutinesStackParamList, 'ImportRoutine'>;

// Map Routine entity to PredesignedRoutine format for the UI
const mapRoutineToPredesigned = (routine: Routine): PredesignedRoutine => {
  // Map difficulty from backend format (BEGINNER/INTERMEDIATE/ADVANCED) to Spanish
  const difficultyMap: Record<string, 'Principiante' | 'Intermedio' | 'Avanzado'> = {
    'BEGINNER': 'Principiante',
    'INTERMEDIATE': 'Intermedio',
    'ADVANCED': 'Avanzado',
  };

  const difficulty = routine.recommended_for
    ? (difficultyMap[routine.recommended_for] || 'Intermedio')
    : 'Intermedio';

  // Calculate exercise count from days or exercises
  let exerciseCount = 0;
  if (routine.days && routine.days.length > 0) {
    exerciseCount = routine.days.reduce((sum, day) =>
      sum + (day.exercises?.length || 0), 0
    );
  } else {
    exerciseCount = routine.exercises?.length || 0;
  }

  // Extract unique muscle groups from exercises
  const muscleGroups = new Set<string>();
  const allExercises = routine.days
    ? routine.days.flatMap(day => day.exercises || [])
    : (routine.exercises || []);

  allExercises.forEach(ex => {
    if (ex.muscular_group) {
      muscleGroups.add(ex.muscular_group);
    }
  });

  // Estimate duration: ~5 minutes per exercise as baseline
  const estimatedDuration = exerciseCount * 5;

  return {
    id: routine.id_routine.toString(),
    name: routine.routine_name,
    difficulty,
    duration: estimatedDuration,
    exerciseCount,
    muscleGroups: Array.from(muscleGroups),
    source: 'template',
  };
};

export default function ImportRoutineScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#111827' : '#f9fafb';

  const navigation = useNavigation<NavigationProp>();
  const [templates, setTemplates] = useState<PredesignedRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const routines = await routineRepository.getTemplates();
      const mapped = (routines || []).map(mapRoutineToPredesigned);
      setTemplates(mapped);
    } catch (error) {
      console.error('[ImportRoutineScreen] Error loading templates:', error);
      Alert.alert('Error', 'No se pudieron cargar las plantillas');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (routine: PredesignedRoutine) => {
    Alert.alert(
      'Importar rutina',
      `¿Deseas importar la rutina "${routine.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          onPress: async () => {
            try {
              const routineId = parseInt(routine.id, 10);
              await routineRepository.importTemplate(routineId);
              Alert.alert('Éxito', 'Rutina importada correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              console.error('[ImportRoutineScreen] Error importing template:', error);
              const errorMessage = error?.response?.data?.error?.message || 'No se pudo importar la rutina';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (routine: PredesignedRoutine) => {
    navigation.navigate('TemplateDetail', { templateId: routine.id });
  };

  if (loading) {
    return (
      <Screen safeAreaTop={true} safeAreaBottom={false}>
        <ScreenHeader title="Importar rutina" onBack={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: bgColor }}>
          <ActivityIndicator size="large" color={isDark ? '#818CF8' : '#4F46E5'} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaTop={true} safeAreaBottom={false}>
      <ScreenHeader title="Importar rutina" onBack={() => navigation.goBack()} />
      <ImportTabHeader
        title="Plantillas disponibles"
        description="Rutinas pre-diseñadas por entrenadores profesionales"
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
      />
      <View className="flex-1" style={{ backgroundColor: bgColor }}>
        <ImportRoutineList
          routines={templates}
          onImport={handleImport}
          onViewDetails={handleViewDetails}
          emptyTitle="No hay plantillas disponibles"
          emptyDescription="Vuelve más tarde para ver nuevas plantillas"
        />
      </View>
    </Screen>
  );
}
