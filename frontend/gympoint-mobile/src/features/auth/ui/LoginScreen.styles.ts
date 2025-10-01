import styled from 'styled-components/native';
import { View } from 'react-native';

import { sp } from '@shared/styles';

export const Root = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => sp(theme, 3)}px ${({ theme }) => sp(theme, 2)}px;
  background-color: ${({ theme }) => theme.colors.bg};
`;

export const contentContainerStyle = {
  flexGrow: 1,
  justifyContent: 'center',
} as const;
