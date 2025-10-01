import styled from 'styled-components/native';

const SetPillContainer = styled.View<{ $done?: boolean; $current?: boolean }>`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background: ${({ theme, $done, $current }) =>
    $done ? theme.colors.primary : $current ? theme.colors.card : theme.colors.muted};
  border: 1px solid
    ${({ theme, $done, $current }) =>
      $done ? theme.colors.primary : $current ? theme.colors.border : theme.colors.muted};
`;

const SetLabel = styled.Text<{ $done?: boolean }>`
  color: ${({ theme, $done }) => ($done ? theme.colors.onPrimary : theme.colors.text)};
  font-weight: 600;
`;

type Props = {
  setNumber: number;
  done?: boolean;
  current?: boolean;
  label?: string;
};

export function SetPill({ setNumber, done = false, current = false, label }: Props) {
  const displayLabel = label || `Serie ${setNumber}`;
  
  return (
    <SetPillContainer $done={done} $current={current}>
      <SetLabel $done={done}>{displayLabel}</SetLabel>
    </SetPillContainer>
  );
}
