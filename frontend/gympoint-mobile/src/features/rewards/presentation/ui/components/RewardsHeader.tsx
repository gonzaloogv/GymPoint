import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { User } from '@features/auth/domain/entities/User';

// Header styled components
const HeaderContainer = styled(View)`
  padding: 16px;
  padding-bottom: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #f3f4f6;
`;

const BackButtonRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const BackButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 4px 0;
`;

const BackIcon = styled(Text)`
  font-size: 20px;
  color: #3b82f6;
  margin-right: 6px;
`;

const BackText = styled(Text)`
  font-size: 16px;
  color: #3b82f6;
  font-weight: 600;
`;

const Title = styled(Text)`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

// Banner styled components
const BannerCard = styled(View)`
  background-color: #f9f5ff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  gap: 12px;
`;

const BannerHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const BannerTitle = styled(Text)`
  font-size: 15px;
  font-weight: 600;
  color: #7c3aed;
`;

const BannerDescription = styled(Text)`
  font-size: 13px;
  color: #7c3aed;
  line-height: 18px;
`;

const ProgressSection = styled(View)`
  gap: 8px;
`;

const ProgressBarContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ProgressBarWrapper = styled(View)`
  flex: 1;
  height: 8px;
  background-color: #e9d5ff;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled(View)<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background-color: #7c3aed;
  border-radius: 4px;
`;

const ProgressText = styled(Text)`
  font-size: 13px;
  font-weight: 600;
  color: #7c3aed;
`;

const ProgressLabel = styled(Text)`
  font-size: 12px;
  color: #7c3aed;
`;

type RewardsHeaderProps = {
  user: User;
};

export const RewardsHeader: React.FC<RewardsHeaderProps> = ({ user }) => {
  const navigation = useNavigation<any>();

  // Calcular progreso hacia la próxima recompensa (ejemplo: necesita 25 tokens)
  const tokensNeeded = 25;
  const currentTokens = user.tokens;
  const progressPercentage = Math.min((currentTokens / tokensNeeded) * 100, 100);

  const handleBack = () => {
    navigation.navigate('Inicio');
  };

  return (
    <>
      <HeaderContainer>
        <BackButtonRow>
          <BackButton onPress={handleBack}>
            <BackIcon>←</BackIcon>
            <BackText>Volver al inicio</BackText>
          </BackButton>
        </BackButtonRow>
        <Title>Recompensas</Title>
      </HeaderContainer>

      <BannerCard>
        <BannerHeader>
          <Ionicons name="help-circle-outline" size={20} color="#7c3aed" />
          <BannerTitle>¿Cómo ganar más tokens?</BannerTitle>
        </BannerHeader>

        <BannerDescription>
          Completá entrenamientos, mantén tu racha y lográ nuevos PRs
        </BannerDescription>

        <ProgressSection>
          <ProgressLabel>Próxima recompensa:</ProgressLabel>
          <ProgressBarContainer>
            <ProgressBarWrapper>
              <ProgressBarFill $progress={progressPercentage} />
            </ProgressBarWrapper>
            <ProgressText>{currentTokens}/{tokensNeeded} tokens</ProgressText>
          </ProgressBarContainer>
        </ProgressSection>
      </BannerCard>
    </>
  );
};
