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
  padding: 20px 0;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
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
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 4px;
  line-height: 20px;
`;

export const LoadingMessage = styled(HeaderTitle)`
  text-align: center;
  margin-top: 50px;
`;

export const TokenDisplay = styled(View)`
  align-items: flex-end;
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  padding: 12px 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
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
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: right;
  margin-top: 2px;
  font-weight: 500;
`;
