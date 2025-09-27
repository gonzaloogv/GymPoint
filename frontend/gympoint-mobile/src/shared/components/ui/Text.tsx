import styled from 'styled-components/native';
import { Text} from 'react-native';

export const H1 = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.h1}px;
  font-weight: 700;
   margin-bottom: ${({ theme }) => theme.spacing(2)}px;
`;

export const Body = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const Subtle = styled(Body)`
  color: ${({ theme }) => theme.colors.subtext};
`;

export const RegisterText = styled(Text)`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(3)}px; /* Espacio debajo del texto */
`;

export const RegisterLink = styled(Text)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration-line: underline;
`;

export const ErrorText = styled(Subtle)`
  margin-top: 6px;
  color: ${p => p.theme?.colors?.danger ?? '#ef4444'};
`;