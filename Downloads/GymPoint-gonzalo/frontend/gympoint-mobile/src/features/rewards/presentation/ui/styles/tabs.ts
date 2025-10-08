import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';

export const TabsContainer = styled(View)`
  width: 100%;
  margin-bottom: 20px;
`;

export const TabsList = styled(View)`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 12px;
  padding: 6px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const TabsTrigger = styled(TouchableOpacity)<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'transparent'};
  align-items: center;
  justify-content: center;
`;

export const TabsTriggerText = styled(Text)<{ $active: boolean }>`
  text-align: center;
  font-weight: 600;
  font-size: 15px;
  color: ${({ $active, theme }) => ($active ? '#ffffff' : theme.colors.textMuted)};
`;

export const TabsContent = styled(View)`
  padding-top: 20px;
  min-height: 200px;
`;
