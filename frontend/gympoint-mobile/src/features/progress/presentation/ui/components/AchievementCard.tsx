import styled from 'styled-components/native';
import { Achievement } from '@features/progress/domain/entities/Progress';

const Container = styled.View<{ locked?: boolean }>`
  background-color: ${({ locked }) => (locked ? '#FAFAFA' : '#E8F5E9')};
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
  border-radius: 16px;
  padding: 16px;
  min-height: 140px;
  justify-content: space-between;
  width: 48%;
  margin-bottom: 12px;
`;

const IconContainer = styled.View`
  align-items: center;
  margin-bottom: 12px;
`;

const Icon = styled.Text`
  font-size: 40px;
`;

const Title = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  text-align: center;
  margin-bottom: 8px;
`;

const ProgressContainer = styled.View`
  margin-top: auto;
`;

const ProgressBar = styled.View`
  height: 6px;
  background-color: #E0E0E0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.View<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background-color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
  border-radius: 3px;
`;

const ProgressText = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme?.colors?.subtext ?? '#6b7280'};
  text-align: center;
  margin-top: 4px;
`;

interface Props {
  achievement: Achievement;
  locked?: boolean;
  progress?: number;
}

export function AchievementCard({ achievement, locked = false, progress = 0 }: Props) {
  return (
    <Container locked={locked}>
      <IconContainer>
        <Icon>{achievement.icon}</Icon>
      </IconContainer>

      <Title>{achievement.title}</Title>

      {locked && (
        <ProgressContainer>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
          <ProgressText>{Math.round(progress)}</ProgressText>
        </ProgressContainer>
      )}
    </Container>
  );
}
