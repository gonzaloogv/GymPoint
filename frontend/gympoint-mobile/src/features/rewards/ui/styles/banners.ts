import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { palette } from '../../../../shared/styles';

export const PremiumBanner = styled(View)`
  background-color: #f3e8ff;
  border-color: #d8b4fe;
  border-width: 1px;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  gap: 8px;
`;

export const PremiumContent = styled(View)`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;

export const PremiumText = styled(Text)`
  font-size: 14px;
  color: #6d28d9;
`;

export const PremiumStrong = styled(Text)`
  font-size: 14px;
  color: #6d28d9;
  font-weight: bold;
`;

export const PremiumLink = styled(TouchableOpacity)`
  margin-top: 4px;
`;

export const PremiumLinkText = styled(Text)`
  color: ${palette.premiumPrimary};
  font-weight: bold;
  font-size: 14px;
`;

export const TipsBanner = styled(View)`
  background-color: ${palette.info}33;
  border-color: ${palette.info};
  border-width: 1px;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  gap: 8px;
`;

export const TipsTitle = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  color: ${palette.info};
`;

export const TipsRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const TipsText = styled(Text)`
  font-size: 14px;
  color: ${palette.infoMuted};
`;
