import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  const palette = {
    primary: '#4F46E5',
    primaryLight: 'rgba(79, 70, 229, 0.15)',
    completed: isDark ? '#6366F1' : '#4338CA',
    track: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
    labelActive: isDark ? '#F9FAFB' : '#111827',
    labelInactive: isDark ? '#9CA3AF' : '#6B7280',
  };

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: palette.track }]} />
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const circleColor = isActive || isCompleted ? palette.primary : palette.track;
        const numberColor = isActive || isCompleted ? '#FFFFFF' : palette.labelInactive;
        const labelColor = isActive ? palette.labelActive : palette.labelInactive;
        const connectorColor = isCompleted ? palette.primary : palette.track;

        return (
          <View key={step.number} style={styles.step}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: circleColor,
                  shadowColor: palette.primary,
                  shadowOpacity: isActive ? 0.22 : 0,
                },
              ]}
            >
              <Text style={[styles.circleText, { color: numberColor }]}>{step.number}</Text>
            </View>

            <View style={styles.labelBlock}>
              <Text style={[styles.label, { color: labelColor }]}>{step.label}</Text>
              {step.subtitle ? (
                <Text style={[styles.subtitle, { color: palette.labelInactive }]}>
                  {step.subtitle}
                </Text>
              ) : null}
            </View>

            <View
              style={[
                styles.connectorSegment,
                {
                  backgroundColor: connectorColor,
                  opacity: index === steps.length - 1 ? 0 : 1,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  track: {
    position: 'absolute',
    top: 24,
    left: 32,
    right: 32,
    height: 2,
    borderRadius: 999,
  },
  step: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  circleText: {
    fontSize: 18,
    fontWeight: '700',
  },
  labelBlock: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  connectorSegment: {
    position: 'absolute',
    top: 24,
    right: -8,
    left: '50%',
    height: 2,
    borderRadius: 999,
    zIndex: -1,
  },
});
