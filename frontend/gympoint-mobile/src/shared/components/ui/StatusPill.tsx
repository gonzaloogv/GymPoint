import styled from 'styled-components/native';

const StatusPillContainer = styled.View<{ $status: 'Active' | 'Scheduled' | 'Completed' }>`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme, $status }) =>
    $status === 'Active' ? theme.colors.primary : theme.colors.card};
  border: 1px solid
    ${({ theme, $status }) =>
      $status === 'Active' ? theme.colors.primary : theme.colors.border};
`;

const StatusText = styled.Text<{ $status: 'Active' | 'Scheduled' | 'Completed' }>`
  color: ${({ theme, $status }) =>
    $status === 'Active' ? theme.colors.onPrimary : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.small}px;
  font-weight: 600;
`;

type Props = {
  status: 'Active' | 'Scheduled' | 'Completed';
  labels?: {
    Active?: string;
    Scheduled?: string;
    Completed?: string;
  };
};

const defaultLabels = {
  Active: 'Activa',
  Scheduled: 'Programada',
  Completed: 'Completada',
};

export function StatusPill({ status, labels = {} }: Props) {
  const finalLabels = { ...defaultLabels, ...labels };
  
  return (
    <StatusPillContainer $status={status}>
      <StatusText $status={status}>{finalLabels[status]}</StatusText>
    </StatusPillContainer>
  );
}
