import styled from 'styled-components/native';
import { rad, sp, font } from '@shared/styles';
import { Text } from 'react-native';

export const Card = styled.View`
  background-color: ${(p) => p.theme?.colors?.card ?? '#fff'};
  border-width: 1px;
  border-color: ${(p) => p.theme?.colors?.border ?? '#e5e7eb'};
  border-radius: ${(p) => rad(p.theme, 'lg', 12)}px;
  padding: ${(p) => sp(p.theme, 2)}px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.06);
  elevation: 2;
`;

export const CardRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const CardTitle = styled.Text`
  color: ${(p) => p.theme?.colors?.text ?? '#111'};
  font-weight: 600;
`;

export const AuthCard = styled.View`
  width: 100%;
  max-width: 460px;
  background-color: ${(p) => p.theme?.colors?.card ?? '#fff'};
  border-width: 1px;
  border-color: ${(p) => p.theme?.colors?.border ?? '#e5e7eb'};
  border-radius: ${(p) => rad(p.theme, 'xl', 16)}px;
  padding: ${(p) => sp(p.theme, 3)}px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.06);
  elevation: 2;
`;

export const AuthCardTitle = styled.Text`
  color: ${(p) => p.theme?.colors?.text ?? '#111'};
  font-size: ${(p) => font(p.theme, 'h4', 18)}px;
  font-weight: 600;
  text-align: center;
  margin-bottom: ${(p) => sp(p.theme, 2)}px;
`;

export const CardMeta = styled(Text)`
  color: ${({ theme }) => theme?.colors?.subtext ?? '#6b7280'};
  font-size: 12px;
`;
