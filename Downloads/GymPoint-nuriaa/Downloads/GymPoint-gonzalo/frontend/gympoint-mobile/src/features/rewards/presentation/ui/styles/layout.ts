import styled from 'styled-components/native';
import { ScrollView, View, Text } from 'react-native';

export const ScrollContainer = styled(ScrollView).attrs({
  contentContainerStyle: { paddingBottom: 48, paddingHorizontal: 16 },
})`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

export const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
  padding-bottom: 24px;
`;

export const HeaderWrapper = styled(View)`
  padding: 20px 0 16px 0;
  background-color: ${({ theme }) => theme.colors.bg};
`;

export const HeaderTexts = styled(View)`
  flex-shrink: 1;
  gap: 4px;
`;

export const HeaderTitle = styled(Text)`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.5px;
`;

export const HeaderSubtitle = styled(Text)`
  font-size: 13px;
  color: #6b7280;
  line-height: 18px;
  flex-direction: row;
  align-items: center;
  background-color: #f9f5ff;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
`;

export const LoadingMessage = styled(HeaderTitle)`
  text-align: center;
  margin-top: 50px;
`;

export const TokenDisplay = styled(View)`
  align-items: flex-end;
  background-color: #fffbeb;
  padding: 12px 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: #fde68a;
`;

export const TokenWrapper = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const TokenText = styled(Text)`
  font-size: 20px;
  font-weight: 700;
  color: #facc15;
`;

export const TokenLabel = styled(Text)`
  font-size: 11px;
  color: #6b7280;
  text-align: right;
  margin-top: 2px;
  font-weight: 500;
`;
