import React from 'react';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { Card } from './Card';
import { Button } from './Button';
import { ButtonText } from './Button';
import { palette } from '@shared/styles';

const CardContent = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)}px;
`;

const IconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${palette.premiumBg};
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(1)}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.h2}px;
  font-weight: 700;
  color: ${palette.premiumLight};
  text-align: center;
`;

const Description = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${palette.premiumLight};
  text-align: center;
  opacity: 0.8;
  margin-bottom: ${({ theme }) => theme.spacing(1)}px;
`;

const BenefitsList = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing(1)}px;
  margin-bottom: ${({ theme }) => theme.spacing(2)}px;
`;

const BenefitItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const BenefitBullet = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${palette.premiumDark};
`;

const BenefitText = styled.Text`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
`;

type Props = {
  title: string;
  description: string;
  benefits: string[];
  buttonText: string;
  onButtonPress: () => void;
  icon?: string;
};

export function PremiumCard({ 
  title, 
  description, 
  benefits, 
  buttonText, 
  onButtonPress,
  icon = "gift"
}: Props) {
  return (
    <Card style={{ borderColor: palette.premiumBorderAlt, borderWidth: 1 }}>
      <CardContent>
        <IconContainer>
          <Feather name={icon as any} size={24} color={palette.premiumLight} />
        </IconContainer>

        <Title>{title}</Title>
        <Description>{description}</Description>

        <BenefitsList>
          {benefits.map((benefit, index) => (
            <BenefitItem key={index}>
              <BenefitBullet />
              <BenefitText>{benefit}</BenefitText>
            </BenefitItem>
          ))}
        </BenefitsList>

        <Button onPress={onButtonPress} style={{ backgroundColor: palette.premiumLight }}>
          <ButtonText style={{ color: '#FFFFFF' }}>{buttonText}</ButtonText>
        </Button>
      </CardContent>
    </Card>
  );
}
