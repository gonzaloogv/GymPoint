import React from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';

import { palette } from '@shared/styles';

const TipsBannerContainer = styled(View)`
  background-color: ${palette.infoSurface};
  border-color: ${palette.infoBorder};
  border-width: 1px;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  gap: 12px;
`;

const TipsHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const TipsIcon = styled(Feather)`
  color: ${palette.info};
`;

const TipsTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${palette.infoStrong};
`;

const TipsList = styled(View)`
  gap: 8px;
`;

const TipsRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const TipsText = styled(Text)`
  font-size: 14px;
  color: ${palette.infoMuted};
  flex: 1;
`;

type TipsBannerProps = {
  tips: Array<{
    icon: keyof typeof Ionicons.glyphMap | keyof typeof Feather.glyphMap;
    iconType: 'ionicons' | 'feather';
    text: string;
  }>;
};

export function TipsBanner({ tips }: TipsBannerProps) {
  return (
    <TipsBannerContainer>
      <TipsHeader>
        <TipsIcon name="info" size={20} />
        <TipsTitle>💡 ¿Cómo ganar más tokens?</TipsTitle>
      </TipsHeader>
      
      <TipsList>
        {tips.map((tip, index) => (
          <TipsRow key={index}>
            {tip.iconType === 'ionicons' ? (
              <Ionicons name={tip.icon as keyof typeof Ionicons.glyphMap} size={14} color={palette.info} />
            ) : (
              <Feather name={tip.icon as keyof typeof Feather.glyphMap} size={14} color={palette.info} />
            )}
            <TipsText>{tip.text}</TipsText>
          </TipsRow>
        ))}
      </TipsList>
    </TipsBannerContainer>
  );
}
