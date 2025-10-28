import { View } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { StepIndicator } from '../components/StepIndicator';
import { BasicInfoStep, ExercisesStep, ReviewStep } from '../components/steps';
import { ScreenHeader } from '../components/ScreenHeader';
import { CreateRoutineFooter } from '../components/CreateRoutineFooter';
import { useCreateRoutine } from '../../hooks/useCreateRoutine';

const STEPS = [
  { number: 1, label: 'Básicos', subtitle: 'Info general' },
  { number: 2, label: 'Ejercicios', subtitle: 'Seleccionar' },
  { number: 3, label: 'Revisión', subtitle: 'Confirmar' },
];

export default function CreateRoutineScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const bgColor = isDark ? '#111827' : '#f9fafb';

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
    <Screen safeAreaTop={true} safeAreaBottom={false}>
      <ScreenHeader title="Nueva rutina" onBack={handleBack} />

      <View className="px-4 py-6" style={{ backgroundColor: cardBg }}>
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </View>

      <View className="flex-1" style={{ backgroundColor: bgColor }}>
        {renderStep()}
      </View>

      <CreateRoutineFooter
        currentStep={currentStep}
        isStepValid={isStepValid}
        buttonLabel={getButtonLabel()}
        onBack={handleBack}
        onNext={handleNext}
      />
    </Screen>
  );
}
