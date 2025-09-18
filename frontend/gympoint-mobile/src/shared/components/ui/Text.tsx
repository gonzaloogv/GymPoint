import styled from 'styled-components/native';

export const H1 = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.h1}px;
  font-weight: 700;
`;

export const Body = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body}px;
`;

export const Subtle = styled(Body)`
  color: ${({ theme }) => theme.colors.subtext};
`;
