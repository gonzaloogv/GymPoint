import { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Exercise } from '@features/routines/domain/entities/Exercise';

type BasicInfo = {
  name: string;
  objective: string;
  muscleGroups: string[];
};

type RoutinesStackParamList = {
  RoutinesList: undefined;
  CreateRoutine: undefined;
};

export function useCreateRoutine() {
  const navigation = useNavigation<NativeStackNavigationProp<RoutinesStackParamList>>();

  const [currentStep, setCurrentStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: '',
    objective: '',
    muscleGroups: [],
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Validación de cada paso
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          basicInfo.name.trim() !== '' &&
          basicInfo.objective !== '' &&
          basicInfo.muscleGroups.length > 0
        );
      case 2:
        return exercises.length > 0 && exercises.every((ex) => ex.name.trim() !== '');
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, basicInfo, exercises]);

  const handleNext = () => {
    if (!isStepValid) return;

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    // TODO: Implementar lógica de guardado
    console.log('Rutina creada:', { basicInfo, exercises });
    navigation.goBack();
  };

  const getButtonLabel = () => {
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
  };
}
