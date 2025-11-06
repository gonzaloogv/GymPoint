import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
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
        <View style={styles.container}>
          <View style={styles.main}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={headerAccent} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: headerAccent }]}>Nueva rutina</Text>
              <Text style={[styles.subtitle, { color: secondary }]}>
                Diseña los pasos para tu siguiente entrenamiento
              </Text>
            </View>
          </View>

          <Card style={styles.stepCard}>
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </Card>

          <View style={styles.stepContent}>{renderStep()}</View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  stepCard: {
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  stepContent: {
    flex: 1,
  },
});
