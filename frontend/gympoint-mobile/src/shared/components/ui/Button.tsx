import styled from 'styled-components/native';

export const Button = styled.TouchableOpacity<{ variant?: 'primary' | 'danger' }>`
  background-color: ${({ theme, variant }) =>
    variant === 'danger' ? theme.colors.danger : theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  padding: ${({ theme }) => theme.spacing(1.75)}px;
  align-items: center;
  justify-content: center;
`;

export const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primaryText};
  font-weight: 700;
`;
