import { View, TouchableOpacity, Text } from 'react-native';
import { SurfaceScreen, Card } from '@shared/components/ui';
import { StepIndicator } from '../components/StepIndicator';
import { BasicInfoStep, ExercisesStep, ReviewStep } from '../components/steps';
import { CreateRoutineFooter } from '../components/CreateRoutineFooter';
import { useCreateRoutine } from '../../hooks/useCreateRoutine';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

const STEPS = [
  { number: 1, label: 'Básicos', subtitle: 'Info general' },
  { number: 2, label: 'Ejercicios', subtitle: 'Seleccionar' },
  { number: 3, label: 'Revisión', subtitle: 'Confirmar' },
];

export default function CreateRoutineScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const headerAccent = isDark ? '#F9FAFB' : '#111827';
  const secondary = isDark ? '#9CA3AF' : '#6B7280';

  const {
    currentStep,
    basicInfo,
    setBasicInfo,
    exercises,
    setExercises,
    isStepValid,
    handleNext,
    handleBack,
    getButtonLabel,
  } = useCreateRoutine();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={basicInfo} onChange={setBasicInfo} />;
      case 2:
        return <ExercisesStep exercises={exercises} onChange={setExercises} />;
      case 3:
        return <ReviewStep basicInfo={basicInfo} exercises={exercises} />;
      default:
        return null;
    }
  };

  return (
    <SurfaceScreen>
      <View className="flex-1">
        <View className="flex-1 px-4 pt-3 pb-6 gap-6">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-2xl items-center justify-center border"
              style={{ borderColor: 'rgba(148, 163, 184, 0.2)' }}
            >
              <Ionicons name="arrow-back" size={20} color={headerAccent} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text
                className="text-[28px] font-extrabold"
                style={{ color: headerAccent, letterSpacing: -0.2 }}
              >
                Nueva rutina
              </Text>
              <Text
                className="mt-1.5 text-[13px] font-medium"
                style={{ color: secondary }}
              >
                Diseña los pasos para tu siguiente entrenamiento
              </Text>
            </View>
          </View>

          <Card className="py-[18px] px-3">
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </Card>

          <View className="flex-1">{renderStep()}</View>
        </View>

        <CreateRoutineFooter
          currentStep={currentStep}
          isStepValid={isStepValid}
          buttonLabel={getButtonLabel()}
          onBack={handleBack}
          onNext={handleNext}
        />
      </View>
    </SurfaceScreen>
  );
}
