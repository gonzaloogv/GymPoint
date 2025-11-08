import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type Step = {
  number: number;
  label: string;
  subtitle?: string;
};

type Props = {
  steps: Step[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const trackColor = isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';
  const labelInactive = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View className="flex-row items-start relative">
      <View
        className="absolute top-6 left-8 right-8 h-0.5 rounded-full"
        style={{ backgroundColor: trackColor }}
      />
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const circleColor = isActive || isCompleted ? '#4F46E5' : trackColor;
        const numberColor = isActive || isCompleted ? '#FFFFFF' : labelInactive;
        const labelColor = isActive ? (isDark ? '#F9FAFB' : '#111827') : labelInactive;
        const connectorColor = isCompleted ? '#4F46E5' : trackColor;

        return (
          <View key={step.number} className="flex-1 px-2 items-center gap-2.5">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: circleColor,
                shadowColor: '#4F46E5',
                shadowOpacity: isActive ? 0.22 : 0,
                elevation: 4,
              }}
            >
              <Text className="text-lg font-bold" style={{ color: numberColor }}>
                {step.number}
              </Text>
            </View>

            <View className="items-center gap-1">
              <Text
                className="text-[13px] font-bold uppercase"
                style={{ color: labelColor, letterSpacing: 1 }}
              >
                {step.label}
              </Text>
              {step.subtitle ? (
                <Text className="text-[11px] font-medium" style={{ color: labelInactive }}>
                  {step.subtitle}
                </Text>
              ) : null}
            </View>

            <View
              className="absolute top-6 right-[-8px] left-[50%] h-0.5 rounded-full -z-10"
              style={{
                backgroundColor: connectorColor,
                opacity: index === steps.length - 1 ? 0 : 1,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
