import React from 'react';
import { View } from 'react-native';
import { Button, ButtonText } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

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
  const borderColor = isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(148, 163, 184, 0.2)';
  const background = isDark ? '#111827' : '#ffffff';

  return (
    <View
      className="px-4 py-6 border-t"
      style={{ borderTopColor: borderColor, backgroundColor: background }}
    >
      <View className="flex-row gap-3">
        {currentStep > 1 ? (
          <Button variant="secondary" onPress={onBack} className="flex-1">
            <ButtonText>Volver</ButtonText>
          </Button>
        ) : null}
        <Button
          variant="primary"
          onPress={onNext}
          disabled={!isStepValid}
          className={currentStep > 1 ? 'flex-[2]' : 'flex-1'}
        >
          <ButtonText>{buttonLabel}</ButtonText>
        </Button>
      </View>
    </View>
  );
}
