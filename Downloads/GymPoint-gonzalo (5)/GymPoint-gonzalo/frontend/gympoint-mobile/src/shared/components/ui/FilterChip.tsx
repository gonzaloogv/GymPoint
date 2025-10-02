import styled from 'styled-components/native';

const ChipContainer = styled.TouchableOpacity<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing(0.75)}px ${({ theme }) => theme.spacing(1.5)}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.card};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  margin-right: ${({ theme }) => theme.spacing(1)}px;
`;

const ChipText = styled.Text<{ $active?: boolean }>`
  color: ${({ theme, $active }) => ($active ? theme.colors.onPrimary : theme.colors.text)};
  font-size: ${({ theme }) => theme.typography.small}px;
  font-weight: 600;
`;

type Props = {
  active?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
};

export function FilterChip({ active = false, onPress, children }: Props) {
  return (
    <ChipContainer $active={active} onPress={onPress}>
      <ChipText $active={active}>{children}</ChipText>
    </ChipContainer>
  );
}
