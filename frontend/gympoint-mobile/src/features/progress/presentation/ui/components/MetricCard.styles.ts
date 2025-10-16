import styled from 'styled-components/native';
import { sp, rad } from '@shared/styles';

export const Container = styled.View`
  background-color: #ffffff;
  border-radius: ${({ theme }) => rad(theme, 'lg', 12)}px;
  padding: ${({ theme }) => sp(theme, 2)}px;
  border-width: 1px;
  border-color: #e5e7eb;
  flex: 1;
  min-height: 100px;
  justify-content: space-between;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: ${({ theme }) => sp(theme, 1)}px;
`;

export const Icon = styled.Text`
  font-size: 18px;
`;

export const Label = styled.Text`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;

export const ValueRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: 4px;
`;

export const Value = styled.Text`
  font-size: 28px;
  font-weight: 800;
  color: #111827;
`;

export const Unit = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
`;

export const ChangeContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: ${({ theme }) => sp(theme, 0.5)}px;
`;

export const ChangeIcon = styled.Text<{ $positive: boolean }>`
  font-size: 14px;
  color: ${({ $positive }) => ($positive ? '#10b981' : '#ef4444')};
`;

export const ChangeText = styled.Text<{ $positive: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? '#10b981' : '#ef4444')};
`;
