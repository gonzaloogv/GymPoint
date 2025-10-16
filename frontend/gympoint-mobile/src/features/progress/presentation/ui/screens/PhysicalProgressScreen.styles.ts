import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { sp } from '@shared/styles';

export const Container = styled.View`
  flex: 1;
  background-color: #ffffff;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => sp(theme, 2)}px;
  border-bottom-width: 1px;
  border-bottom-color: #f3f4f6;
`;

export const BackButton = styled(TouchableOpacity)`
  margin-right: ${({ theme }) => sp(theme, 2)}px;
`;

export const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  flex: 1;
`;

export const ActionsRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

export const ActionButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`;

export const ScrollView = styled.ScrollView`
  flex: 1;
`;

export const Content = styled.View`
  padding: ${({ theme }) => sp(theme, 2)}px;
`;

export const MetricsRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => sp(theme, 1.5)}px;
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
`;

export const SelectorContainer = styled.View`
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
  align-items: center;
`;

export const ErrorText = styled.Text`
  color: #ef4444;
  font-size: 14px;
`;
