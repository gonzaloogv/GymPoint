import styled from 'styled-components/native';
import { Button, ButtonText } from '@shared/components/ui';

const Footer = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  background: ${({ theme }) => theme.colors.bg};
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const OutlineButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  min-height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const OutlineLabel = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

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
  const getButtonText = () => {
    if (currentSet < totalSets) {
      return 'Marcar serie completa';
    }
    if (exerciseIndex < totalExercises - 1) {
      return 'Continuar al siguiente';
    }
    return 'Finalizar';
  };

  return (
    <Footer>
      <Button onPress={onCompleteSet}>
        <ButtonText>{getButtonText()}</ButtonText>
      </Button>

      <OutlineButton onPress={onPrevious} disabled={exerciseIndex === 0}>
        <OutlineLabel>Anterior</OutlineLabel>
      </OutlineButton>

      <OutlineButton onPress={onNext} disabled={exerciseIndex === totalExercises - 1}>
        <OutlineLabel>Siguiente</OutlineLabel>
      </OutlineButton>
    </Footer>
  );
}
