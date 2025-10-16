import styled from 'styled-components/native';
import { sp } from '@shared/styles';
import { ScrollView } from 'react-native';

export const Container = styled.View`
  flex: 1;
  background-color: #ffffff;
`;

export const ScrollContainer = styled(ScrollView)`
  flex: 1;
  background-color: #ffffff;
`;

export const Content = styled.View`
  padding: ${({ theme }) => sp(theme, 2)}px;
`;

export const StatsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
`;

export const SectionsContainer = styled.View`
  margin-top: ${({ theme }) => sp(theme, 2)}px;
`;
