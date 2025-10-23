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
  const primaryColor = '#3B82F6';
  const inactiveColor = '#e5e7eb';
  const inactiveText = isDark ? '#9ca3af' : '#6b7280';
  const titleActive = isDark ? '#ffffff' : '#000000';

  return (
    <View className="flex-row justify-between items-start py-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const isLast = index === steps.length - 1;
        const circleColor = isCompleted || isActive ? primaryColor : inactiveColor;
        const numberColor = isCompleted || isActive ? '#ffffff' : inactiveText;
        const titleColor = isActive ? primaryColor : inactiveText;

        return (
          <View key={step.number} className="flex-1 items-center relative">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-1 z-10"
              style={{ backgroundColor: circleColor }}
            >
              <Text className="font-bold text-lg" style={{ color: numberColor }}>
                {step.number}
              </Text>
            </View>
            <View className="items-center gap-0.5">
              <Text
                className={`text-sm ${isActive ? 'font-bold' : 'font-semibold'} text-center`}
                style={{ color: titleColor }}
              >
                {step.label}
              </Text>
              {step.subtitle && (
                <Text className="text-xs text-center" style={{ color: inactiveText }}>
                  {step.subtitle}
                </Text>
              )}
            </View>
            {!isLast && (
              <View
                className="absolute"
                style={{
                  top: 24,
                  left: '50%',
                  right: '-50%',
                  height: 2,
                  backgroundColor: isCompleted ? primaryColor : inactiveColor,
                  zIndex: 1,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
