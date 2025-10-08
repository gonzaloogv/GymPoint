import styled from 'styled-components/native';
import { View, ScrollView, Text } from 'react-native';
import { sp } from '@shared/styles';

/** Container para steps con scroll */
export const StepScrollContainer = styled(ScrollView).attrs({
  contentContainerStyle: { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 40 },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

/** Container para steps sin scroll (centrado) */
export const StepCenteredContainer = styled(View)`
  flex: 1;
  padding: ${({ theme }) => sp(theme, 2)}px;
  align-items: center;
  justify-content: center;
`;

/** Texto placeholder para pasos en desarrollo */
export const StepPlaceholderText = styled(Text)`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
`;

/** Section separada dentro de un step */
export const StepSection = styled(View)`
  margin-bottom: ${({ theme }) => sp(theme, 3)}px;
`;
