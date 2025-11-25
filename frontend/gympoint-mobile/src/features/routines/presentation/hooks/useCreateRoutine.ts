import { useState, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { routineRepository } from '../../data/RoutineRepositoryImpl';
import { useRoutinesStore } from '../state/routines.store';
import { useUserProfileStore } from '@features/user/presentation/state/userProfile.store';

type BasicInfo = {
  name: string;
  objective: string;
  muscleGroups: string[];
};

type ExerciseForm = {
  id_exercise: number;
  name: string;
  series: number;
  reps: number;
};

type RoutinesStackParamList = {
  RoutinesList: undefined;
  CreateRoutine: undefined;
};

const FREE_ROUTINE_LIMIT = 5;

export function useCreateRoutine() {
  const navigation = useNavigation<NativeStackNavigationProp<RoutinesStackParamList>>();
  const { routines } = useRoutinesStore();
  const { profile, setShowPremiumModal } = useUserProfileStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: '',
    objective: '',
    muscleGroups: [],
  });
  const [exercises, setExercises] = useState<ExerciseForm[]>([]);
  const [loading, setLoading] = useState(false);

  // Validación de cada paso
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        const hasName = basicInfo.name.trim() !== '';
        const hasObjective = basicInfo.objective !== '';
        const hasMuscleGroups = basicInfo.muscleGroups.length > 0;

        console.log('🔍 Step 1 Validation:', {
          name: basicInfo.name,
          hasName,
          objective: basicInfo.objective,
          hasObjective,
          muscleGroups: basicInfo.muscleGroups,
          hasMuscleGroups,
          isValid: hasName && hasObjective && hasMuscleGroups,
        });

        return hasName && hasObjective && hasMuscleGroups;
      case 2:
        const hasExercises = exercises.length > 0;
        const allExercisesValid = exercises.every(
          (ex) => ex.id_exercise > 0 && ex.name.trim() !== ''
        );

        console.log('🔍 Step 2 Validation:', {
          exercisesCount: exercises.length,
          hasExercises,
          exercises: exercises,
          allExercisesValid,
          isValid: hasExercises && allExercisesValid,
        });

        return hasExercises && allExercisesValid;
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, basicInfo, exercises]);

  const handleNext = useCallback(() => {
    if (!isStepValid) return;

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, isStepValid]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  const handleSubmit = useCallback(async () => {
    // Check routine limit for free users
    if (profile?.plan === 'Free' && routines.length >= FREE_ROUTINE_LIMIT) {
      Alert.alert(
        '⭐ Límite alcanzado',
        `Los usuarios gratuitos pueden crear hasta ${FREE_ROUTINE_LIMIT} rutinas.\n\n¿Quieres desbloquear rutinas ilimitadas con Premium?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Ver Premium',
            onPress: () => {
              setShowPremiumModal(true);
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }

    setLoading(true);

    const payload = {
      routine_name: basicInfo.name,
      description: basicInfo.objective,
      exercises: exercises.map((ex, index) => ({
        id_exercise: ex.id_exercise,
        series: ex.series,
        reps: String(ex.reps), // Backend espera string, lo convierte a INTEGER internamente
        order: index + 1,
      })),
    };

    console.log('📤 Creating routine with payload:', JSON.stringify(payload, null, 2));

    try {
      // Create routine in backend
      const result = await routineRepository.create(payload);
      console.log('✅ Routine created successfully:', result);

      // Navigate back to list
      navigation.navigate('RoutinesList');
    } catch (error: any) {
      console.error('❌ Error creating routine:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });

      // Show user-friendly error message
      alert(`Error al crear rutina: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [basicInfo, exercises, navigation, profile, routines.length, setShowPremiumModal]);

  const getButtonLabel = () => {
    if (loading) return 'Creando...';
    return currentStep === 3 ? 'Crear rutina' : 'Siguiente';
  };

  return {
    currentStep,
    basicInfo,
    setBasicInfo,
    exercises,
    setExercises,
    isStepValid,
    handleNext,
    handleBack,
    getButtonLabel,
    loading,
  };
}
