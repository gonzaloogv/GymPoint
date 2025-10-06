import React from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';

const TipsBannerContainer = styled(View)`
  background-color: ${({ theme }) => theme.colors.infoLight || '#EFF6FF'};
  border-color: ${({ theme }) => theme.colors.infoBorder || '#BFDBFE'};
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  padding: ${({ theme }) => theme.spacing(2)}px;
  margin-top: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1.5)}px;
`;

const TipsHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const TipsIcon = styled(Feather)`
  color: ${({ theme }) => theme.colors.info || '#3B82F6'};
`;

const TipsTitle = styled(Text)`
  font-size: ${({ theme }) => theme.typography.body}px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const TipsList = styled(View)`
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const TipsRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const TipsText = styled(Text)`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ theme }) => theme.colors.subtext};
  flex: 1;
`;

type TipsBannerProps = {
  title?: string;
  tips: Array<{
    icon: keyof typeof Ionicons.glyphMap | keyof typeof Feather.glyphMap;
    iconType: 'ionicons' | 'feather';
    text: string;
  }>;
  iconColor?: string;
};

export function TipsBanner({ title = '💡 Tips', tips, iconColor }: TipsBannerProps) {
  return (
    <TipsBannerContainer>
      <TipsHeader>
        <TipsIcon name="info" size={20} />
        <TipsTitle>{title}</TipsTitle>
      </TipsHeader>

      <TipsList>
        {tips.map((tip, index) => (
          <TipsRow key={index}>
            {tip.iconType === 'ionicons' ? (
              <Ionicons
                name={tip.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={iconColor || '#3B82F6'}
              />
            ) : (
              <Feather
                name={tip.icon as keyof typeof Feather.glyphMap}
                size={14}
                color={iconColor || '#3B82F6'}
              />
            )}
            <TipsText>{tip.text}</TipsText>
          </TipsRow>
        ))}
      </TipsList>
    </TipsBannerContainer>
  );
}
