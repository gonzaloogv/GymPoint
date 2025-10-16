import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';

export const TabsContainer = styled(View)`
  width: 100%;
  margin-bottom: 16px;
  margin-top: 16px;
`;

export const TabsList = styled(View)`
  flex-direction: row;
  background-color: #f3f4f6;
  border-radius: 10px;
  padding: 4px;
  gap: 6px;
`;

export const TabsTrigger = styled(TouchableOpacity)<{ $active: boolean }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  background-color: ${({ $active }) =>
    $active ? '#ffffff' : 'transparent'};
  align-items: center;
  justify-content: center;
  shadow-color: ${({ $active }) => ($active ? '#000' : 'transparent')};
  shadow-offset: ${({ $active }) => ($active ? '0px 1px' : '0px 0px')};
  shadow-opacity: ${({ $active }) => ($active ? 0.1 : 0)};
  shadow-radius: ${({ $active }) => ($active ? 2 : 0)};
  elevation: ${({ $active }) => ($active ? 1 : 0)};
`;

export const TabsTriggerText = styled(Text)<{ $active: boolean }>`
  text-align: center;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  font-size: 14px;
  color: ${({ $active }) => ($active ? '#1f2937' : '#6b7280')};
`;

export const TabsContent = styled(View)`
  padding-top: 16px;
  min-height: 200px;
`;
