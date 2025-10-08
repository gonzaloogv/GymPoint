import React from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';

const Container = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing(2)}px 0;
`;

const StepWrapper = styled(View)`
  flex: 1;
  align-items: center;
  position: relative;
`;

const StepCircle = styled(View)<{ $active: boolean; $completed: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme, $active, $completed }) =>
    $completed || $active ? theme.colors.primary : '#E5E7EB'};
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(1)}px;
  z-index: 2;
`;

const StepNumber = styled(Text)<{ $active: boolean; $completed: boolean }>`
  color: ${({ $active, $completed }) => ($completed || $active ? '#fff' : '#9CA3AF')};
  font-weight: 700;
  font-size: 18px;
`;

const LabelsContainer = styled(View)`
  align-items: center;
  gap: 2px;
`;

const StepTitle = styled(Text)<{ $active: boolean }>`
  font-size: 14px;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : '#6B7280')};
  font-weight: ${({ $active }) => ($active ? '700' : '600')};
  text-align: center;
`;

const StepSubtitle = styled(Text)<{ $active: boolean }>`
  font-size: 11px;
  color: ${({ $active }) => ($active ? '#6B7280' : '#9CA3AF')};
  font-weight: 400;
  text-align: center;
`;

const LineContainer = styled(View)`
  position: absolute;
  top: 24px;
  left: 50%;
  right: -50%;
  height: 2px;
  z-index: 1;
`;

const Line = styled(View)<{ $completed: boolean }>`
  height: 2px;
  background-color: ${({ theme, $completed }) =>
    $completed ? theme.colors.primary : '#E5E7EB'};
`;

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
  return (
    <Container>
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const isLast = index === steps.length - 1;

        return (
          <StepWrapper key={step.number}>
            <StepCircle $active={isActive} $completed={isCompleted}>
              <StepNumber $active={isActive} $completed={isCompleted}>
                {step.number}
              </StepNumber>
            </StepCircle>
            <LabelsContainer>
              <StepTitle $active={isActive}>{step.label}</StepTitle>
              {step.subtitle && (
                <StepSubtitle $active={isActive}>{step.subtitle}</StepSubtitle>
              )}
            </LabelsContainer>
            {!isLast && (
              <LineContainer>
                <Line $completed={isCompleted} />
              </LineContainer>
            )}
          </StepWrapper>
        );
      })}
    </Container>
  );
}
