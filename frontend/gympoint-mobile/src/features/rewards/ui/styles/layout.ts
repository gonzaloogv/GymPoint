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
  padding: 16px 0;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const HeaderTexts = styled(View)`
  flex-shrink: 1;
  gap: 4px;
`;

export const HeaderTitle = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

export const HeaderSubtitle = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const LoadingMessage = styled(HeaderTitle)`
  text-align: center;
  margin-top: 50px;
`;

export const TokenDisplay = styled(View)`
  align-items: flex-end;
`;

export const TokenWrapper = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const TokenText = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

export const TokenLabel = styled(Text)`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: right;
`;
