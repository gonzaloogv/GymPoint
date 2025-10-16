import styled from 'styled-components/native';
import { sp, rad } from '@shared/styles';

export const Container = styled.View`
  background-color: #ffffff;
  border-radius: ${({ theme }) => rad(theme, 'lg', 12)}px;
  padding: ${({ theme }) => sp(theme, 2)}px;
  border-width: 1px;
  border-color: #e5e7eb;
  margin-top: ${({ theme }) => sp(theme, 2)}px;
`;

export const Title = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: ${({ theme }) => sp(theme, 2)}px;
`;

export const ChartPlaceholder = styled.View`
  height: 200px;
  background-color: #f9fafb;
  border-radius: ${({ theme }) => rad(theme, 'md', 8)}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: #e5e7eb;
  border-style: dashed;
`;

export const ChartIcon = styled.Text`
  font-size: 48px;
  margin-bottom: ${({ theme }) => sp(theme, 1)}px;
`;

export const ChartText = styled.Text`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`;

export const ChartInfo = styled.Text`
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  margin-top: ${({ theme }) => sp(theme, 1)}px;
`;

export const SummaryRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${({ theme }) => sp(theme, 2)}px;
  padding-top: ${({ theme }) => sp(theme, 2)}px;
  border-top-width: 1px;
  border-top-color: #f3f4f6;
`;

export const SummaryItem = styled.View`
  align-items: center;
`;

export const SummaryLabel = styled.Text`
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
`;

export const SummaryValue = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: #111827;
`;
