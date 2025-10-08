import styled from 'styled-components/native';

const ChipContainer = styled.View`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background: ${({ theme }) => theme.colors.muted};
`;

const ChipText = styled.Text`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ theme }) => theme.colors.text};
`;

type Props = {
  children: React.ReactNode;
};

export function MetaChip({ children }: Props) {
  return (
    <ChipContainer>
      <ChipText>{children}</ChipText>
    </ChipContainer>
  );
}
