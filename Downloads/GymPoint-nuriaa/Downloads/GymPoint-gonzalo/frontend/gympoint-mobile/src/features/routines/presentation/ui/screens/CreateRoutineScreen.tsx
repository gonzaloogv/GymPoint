import styled from 'styled-components/native';
import { View } from 'react-native';
import { Screen } from '@shared/components/ui';
import { StepIndicator } from '../components/StepIndicator';
import { BasicInfoStep, ExercisesStep, ReviewStep } from '../components/steps';
import { ScreenHeader } from '../components/ScreenHeader';
import { CreateRoutineFooter } from '../components/CreateRoutineFooter';
import { useCreateRoutine } from '../../hooks/useCreateRoutine';
import { sp } from '@shared/styles';

const StepIndicatorContainer = styled(View)`
  padding: ${({ theme }) => sp(theme, 3)}px ${({ theme }) => sp(theme, 2)}px;
  background-color: ${({ theme }) => theme.colors.card};
`;

const ContentContainer = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const STEPS = [
  { number: 1, label: 'Básicos', subtitle: 'Info general' },
  { number: 2, label: 'Ejercicios', subtitle: 'Seleccionar' },
  { number: 3, label: 'Revisión', subtitle: 'Confirmar' },
];

export default function CreateRoutineScreen() {
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
    console.log('Rendering step:', currentStep, 'basicInfo:', basicInfo);
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
    <Screen>
      <ScreenHeader title="Nueva rutina" onBack={handleBack} />

      <StepIndicatorContainer>
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </StepIndicatorContainer>

      <ContentContainer>{renderStep()}</ContentContainer>

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
