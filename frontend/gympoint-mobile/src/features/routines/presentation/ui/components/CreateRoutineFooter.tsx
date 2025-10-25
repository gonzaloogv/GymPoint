import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button } from '@shared/components/ui';

type Props = {
  currentStep: number;
  isStepValid: boolean;
  buttonLabel: string;
  onBack: () => void;
  onNext: () => void;
};

export function CreateRoutineFooter({
  currentStep,
  isStepValid,
  buttonLabel,
  onBack,
  onNext,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const bgColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const buttonBg = isStepValid ? '#3B82F6' : '#d1d5db';
  const buttonText = isStepValid ? '#ffffff' : '#9ca3af';

  return (
    <View
      className="p-6 border-t"
      style={{
        backgroundColor: bgColor,
        borderTopColor: borderColor,
      }}
    >
      <View className="flex-row gap-3">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onPress={onBack}
            className="flex-1"
            style={{
              backgroundColor: bgColor,
              borderWidth: 1,
              borderColor: borderColor,
            }}
          >
            <Text className="font-semibold text-base" style={{ color: textColor }}>
              Atrás
            </Text>
          </Button>
        )}
        <Button
          variant="primary"
          onPress={onNext}
          disabled={!isStepValid}
          className="flex-[2]"
          style={{
            backgroundColor: buttonBg,
            opacity: isStepValid ? 1 : 0.6,
          }}
        >
          <Text className="font-semibold text-base" style={{ color: buttonText }}>
            {buttonLabel}
          </Text>
        </Button>
      </View>
    </View>
  );
}
