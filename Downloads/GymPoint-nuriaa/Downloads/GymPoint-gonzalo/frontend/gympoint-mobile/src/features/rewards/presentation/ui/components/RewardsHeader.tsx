import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@features/auth/domain/entities/User';
import { HeaderWrapper, HeaderTitle } from '../styles/layout';

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
  // Calcular progreso hacia la próxima recompensa (ejemplo: necesita 25 tokens)
  const tokensNeeded = 25;
  const currentTokens = user.tokens;
  const progressPercentage = Math.min((currentTokens / tokensNeeded) * 100, 100);

  return (
    <>
      <HeaderWrapper>
        <HeaderTitle>Recompensas</HeaderTitle>
      </HeaderWrapper>

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
