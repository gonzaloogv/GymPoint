import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';

export const TabsContainer = styled(View)`
  width: 100%;
  margin-bottom: 16px;
`;

export const TabsList = styled(View)`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 8px;
  padding: 4px;
`;

export const TabsTrigger = styled(TouchableOpacity)<{ $active: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'transparent'};
`;

export const TabsTriggerText = styled(Text)<{ $active: boolean }>`
  text-align: center;
  font-weight: 600;
  color: ${({ $active, theme }) => ($active ? '#ffffff' : theme.colors.textMuted)};
`;

export const TabsContent = styled(View)`
  padding-top: 16px;
`;
