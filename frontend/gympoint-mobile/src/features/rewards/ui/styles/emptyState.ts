import styled from 'styled-components/native';
import { View, Text } from 'react-native';

export const EmptyStateWrapper = styled(View)`
  padding: 40px;
  align-items: center;
  background-color: #ffffff;
  border-radius: 12px;
  gap: 8px;
`;

export const EmptyStateTitle = styled(Text)`
  font-weight: bold;
  font-size: 16px;
`;

export const EmptyStateDescription = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;
