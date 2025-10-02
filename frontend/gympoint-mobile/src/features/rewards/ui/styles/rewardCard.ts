import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import { palette } from '../../../../shared/styles';

export const RewardCard = styled(View)<{ $affordable: boolean; $available: boolean }>`
  background-color: ${({ theme }) => theme.colors.cardBg};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  opacity: ${({ $available }) => ($available ? 1 : 0.5)};
  border-width: 1px;
  border-color: ${({ $affordable, theme }) =>
    $affordable ? theme.colors.successBorder : theme.colors.border};
`;

export const RewardCardContent = styled(View)`
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
`;

export const RewardIcon = styled(View)`
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

export const RewardIconText = styled(Text)`
  font-size: 24px;
`;

export const RewardInfo = styled(View)`
  flex: 1;
  gap: 8px;
`;

export const RewardHeaderRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 12px;
`;

export const RewardHeaderTexts = styled(View)`
  flex-shrink: 1;
  gap: 4px;
`;

export const RewardTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const RewardDescription = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const RewardCost = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const CostText = styled(Text)`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

export const BadgeWrapper = styled(View)`
  flex-direction: row;
  gap: 8px;
`;

export const CategoryBadge = styled(View)<{ $color: string }>`
  padding: 4px 8px;
  border-radius: 10px;
  background-color: ${({ $color }) => $color};
`;

export const CategoryBadgeText = styled(Text)`
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
`;

export const ValidityRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export const ValidityText = styled(Text)`
  font-size: 10px;
  color: ${palette.slate500};
`;

export const TermsText = styled(Text)`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;
