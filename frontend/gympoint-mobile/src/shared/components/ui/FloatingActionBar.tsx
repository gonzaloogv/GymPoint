import styled from 'styled-components/native';
import { Button } from './Button';

const ActionBar = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: ${({ theme }) => theme.spacing(2)}px;
  background-color: ${({ theme }) => theme.colors.bg};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  gap: ${({ theme }) => theme.spacing(1)}px;
  flex-direction: row;
`;

const ActionButton = styled(Button)`
  flex: 1;
  min-height: 48px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  text-align: center;
  font-weight: 600;
`;

type Action = {
  label: string;
  onPress: () => void;
};

type Props = {
  actions: Action[];
};

export function FloatingActionBar({ actions }: Props) {
  return (
    <ActionBar>
      {actions.map((action, index) => (
        <ActionButton key={index} onPress={action.onPress}>
          <ButtonText>{action.label}</ButtonText>
        </ActionButton>
      ))}
    </ActionBar>
  );
}
