import styled from 'styled-components/native';
import { View } from 'react-native';
import { Button } from '@shared/components/ui';
import { sp } from '@shared/styles';

const FooterContainer = styled(View)`
  padding: ${({ theme }) => sp(theme, 2.5)}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
`;

const ButtonsRow = styled(View)`
  flex-direction: row;
  gap: 12px;
`;

const BackButton = styled(Button)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const BackButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 15px;
`;

const NextButton = styled(Button)<{ disabled?: boolean }>`
  flex: 2;
  background-color: ${({ theme, disabled }) =>
    disabled ? '#D1D5DB' : theme.colors.primary};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const NextButtonText = styled.Text<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? '#9CA3AF' : '#fff')};
  font-weight: 600;
  font-size: 15px;
`;

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
  return (
    <FooterContainer>
      <ButtonsRow>
        {currentStep > 1 && (
          <BackButton onPress={onBack}>
            <BackButtonText>Atrás</BackButtonText>
          </BackButton>
        )}
        <NextButton onPress={onNext} disabled={!isStepValid}>
          <NextButtonText disabled={!isStepValid}>{buttonLabel}</NextButtonText>
        </NextButton>
      </ButtonsRow>
    </FooterContainer>
  );
}
