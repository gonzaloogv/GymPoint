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

  const lineColor = isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.3)';
  const labelInactive = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View className="flex-row items-start relative">
      {/* Simple background line */}
      <View
        className="absolute h-0.5 rounded-full"
        style={{
          backgroundColor: lineColor,
          top: 24,
          left: '16.666%',
          right: '16.666%',
        }}
      />

      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const circleColor = isActive || isCompleted ? '#4F46E5' : (isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB');
        const numberColor = isActive || isCompleted ? '#FFFFFF' : labelInactive;
        const labelColor = isActive ? (isDark ? '#F9FAFB' : '#111827') : labelInactive;

        return (
          <View key={step.number} className="flex-1 items-center gap-2.5">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: circleColor,
                shadowColor: '#4F46E5',
                shadowOpacity: isActive ? 0.22 : 0,
                elevation: 4,
                zIndex: 1,
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
          </View>
        );
      })}
    </View>
  );
}
