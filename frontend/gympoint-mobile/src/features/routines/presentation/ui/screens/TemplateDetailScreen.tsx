import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Screen, BackButton, Button, InfoCard } from '@shared/components/ui';
import { routineRepository } from '@features/routines/data/RoutineRepositoryImpl';
import { Routine } from '@features/routines/domain/entities/Routine';

interface TemplateDetailScreenProps {
  route: {
    params: {
      templateId: string;
    };
  };
  navigation: any;
}

export default function TemplateDetailScreen({ route, navigation }: TemplateDetailScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#111827' : '#f9fafb';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280';

  const [template, setTemplate] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);

  const templateId = parseInt(route.params.templateId, 10);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const data = await routineRepository.getById(templateId);
      setTemplate(data);
    } catch (error) {
      console.error('[TemplateDetailScreen] Error loading template:', error);
      Alert.alert('Error', 'No se pudo cargar la plantilla');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      'Importar rutina',
      `¿Deseas importar la rutina "${template?.routine_name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          onPress: async () => {
            try {
              await routineRepository.importTemplate(templateId);
              Alert.alert('Éxito', 'Rutina importada correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              console.error('[TemplateDetailScreen] Error importing:', error);
              const errorMessage = error?.response?.data?.error?.message || 'No se pudo importar la rutina';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const getDifficultyLabel = (difficulty: string | null) => {
    if (!difficulty) return 'Intermedio';
    const map: Record<string, string> = {
      'BEGINNER': 'Principiante',
      'INTERMEDIATE': 'Intermedio',
      'ADVANCED': 'Avanzado',
    };
    return map[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty: string | null) => {
    if (!difficulty) return '#F59E0B';
    const map: Record<string, string> = {
      'BEGINNER': '#10B981',
      'INTERMEDIATE': '#F59E0B',
      'ADVANCED': '#EF4444',
    };
    return map[difficulty] || '#F59E0B';
  };

  if (loading) {
    return (
      <Screen safeAreaTop={true} safeAreaBottom={false}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: bgColor }}>
          <ActivityIndicator size="large" color={isDark ? '#818CF8' : '#4F46E5'} />
        </View>
      </Screen>
    );
  }

  if (!template) {
    return (
      <Screen safeAreaTop={true} safeAreaBottom={false}>
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: bgColor }}>
          <Text style={{ color: textColor }}>Plantilla no encontrada</Text>
        </View>
      </Screen>
    );
  }

  const difficultyLabel = getDifficultyLabel(template.recommended_for);
  const difficultyColor = getDifficultyColor(template.recommended_for);

  return (
    <Screen safeAreaTop={true} safeAreaBottom={false}>
      <View className="px-4 pt-4">
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <ScrollView
        style={{ backgroundColor: bgColor }}
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mt-6 mb-6">
          <Text
            className="text-3xl font-bold mb-3"
            style={{ color: textColor, letterSpacing: -0.5 }}
          >
            {template.routine_name}
          </Text>

          <View className="flex-row items-center gap-3 mb-4">
            <Text
              className="text-sm font-bold uppercase"
              style={{ color: difficultyColor, letterSpacing: 0.5 }}
            >
              {difficultyLabel}
            </Text>
            {template.exercises && (
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="list-outline" size={16} color={mutedColor} />
                <Text className="text-sm font-semibold" style={{ color: mutedColor }}>
                  {template.exercises.length} ejercicios
                </Text>
              </View>
            )}
            {template.days && template.days.length > 0 && (
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="calendar-outline" size={16} color={mutedColor} />
                <Text className="text-sm font-semibold" style={{ color: mutedColor }}>
                  {template.days.length} días
                </Text>
              </View>
            )}
          </View>

          {template.description && (
            <Text className="text-base leading-6" style={{ color: mutedColor }}>
              {template.description}
            </Text>
          )}
        </View>

        {/* Days Section */}
        {template.days && template.days.length > 0 && (
          <View className="mb-6">
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: textColor, letterSpacing: -0.3 }}
            >
              Días de entrenamiento
            </Text>
            {template.days.map((day) => (
              <InfoCard key={day.id_routine_day} className="mb-3">
                <View className="p-4">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: isDark ? '#4F46E5' : '#EEF2FF' }}
                    >
                      <Text
                        className="text-sm font-bold"
                        style={{ color: isDark ? '#C7D2FE' : '#4F46E5' }}
                      >
                        {day.day_number}
                      </Text>
                    </View>
                    <Text className="text-lg font-bold flex-1" style={{ color: textColor }}>
                      {day.title || `Día ${day.day_number}`}
                    </Text>
                  </View>
                  {day.description && (
                    <Text className="text-sm ml-11" style={{ color: mutedColor }}>
                      {day.description}
                    </Text>
                  )}
                  {day.exercises && day.exercises.length > 0 && (
                    <View className="ml-11 mt-3">
                      {day.exercises.map((exercise, idx) => (
                        <View key={idx} className="flex-row items-center mb-2">
                          <Ionicons name="fitness-outline" size={14} color={mutedColor} />
                          <Text className="text-sm ml-2 flex-1" style={{ color: textColor }}>
                            {exercise.exercise_name}
                          </Text>
                          {exercise.series && exercise.reps && (
                            <Text className="text-xs" style={{ color: mutedColor }}>
                              {exercise.series} × {exercise.reps}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </InfoCard>
            ))}
          </View>
        )}

        {/* Exercises Section (if no days) */}
        {(!template.days || template.days.length === 0) && template.exercises && template.exercises.length > 0 && (
          <View className="mb-6">
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: textColor, letterSpacing: -0.3 }}
            >
              Ejercicios
            </Text>
            {template.exercises.map((exercise, idx) => (
              <InfoCard key={exercise.id_exercise} className="mb-3">
                <View className="p-4 flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: isDark ? '#4F46E5' : '#EEF2FF' }}
                  >
                    <Ionicons name="fitness-outline" size={18} color={isDark ? '#C7D2FE' : '#4F46E5'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold mb-1" style={{ color: textColor }}>
                      {exercise.exercise_name}
                    </Text>
                    <Text className="text-xs" style={{ color: mutedColor }}>
                      {exercise.muscular_group}
                    </Text>
                  </View>
                  {exercise.series && exercise.reps && (
                    <View className="items-end">
                      <Text className="text-sm font-semibold" style={{ color: textColor }}>
                        {exercise.series} series
                      </Text>
                      <Text className="text-xs" style={{ color: mutedColor }}>
                        {exercise.reps} reps
                      </Text>
                    </View>
                  )}
                </View>
              </InfoCard>
            ))}
          </View>
        )}

        {/* Import Button */}
        <View className="mt-4 mb-6">
          <Button onPress={handleImport}>
            Importar rutina
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
