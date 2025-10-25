import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button, ButtonText } from '@shared/components/ui';

type Props = {
  currentSet: number;
  totalSets: number;
  exerciseIndex: number;
  totalExercises: number;
  onCompleteSet: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function ExecutionFooter({
  currentSet,
  totalSets,
  exerciseIndex,
  totalExercises,
  onCompleteSet,
  onPrevious,
  onNext,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const bgColor = isDark ? '#111827' : '#f9fafb';

  const getButtonText = () => {
    if (currentSet < totalSets) {
      return 'Marcar serie completa';
    }
    if (exerciseIndex < totalExercises - 1) {
      return 'Continuar al siguiente';
    }
    return 'Finalizar';
  };

  const isPrevDisabled = exerciseIndex === 0;
  const isNextDisabled = exerciseIndex === totalExercises - 1;

  return (
    <View className="p-4 gap-1" style={{ backgroundColor: bgColor }}>
      <Button onPress={onCompleteSet}>
        <ButtonText>{getButtonText()}</ButtonText>
      </Button>

      <TouchableOpacity
        onPress={onPrevious}
        disabled={isPrevDisabled}
        className="min-h-12 items-center justify-center rounded-lg border"
        style={{
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1,
          opacity: isPrevDisabled ? 0.5 : 1,
        }}
      >
        <Text className="font-semibold" style={{ color: textColor }}>
          Anterior
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNext}
        disabled={isNextDisabled}
        className="min-h-12 items-center justify-center rounded-lg border"
        style={{
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1,
          opacity: isNextDisabled ? 0.5 : 1,
        }}
      >
        <Text className="font-semibold" style={{ color: textColor }}>
          Siguiente
        </Text>
      </TouchableOpacity>
    </View>
  );
}
