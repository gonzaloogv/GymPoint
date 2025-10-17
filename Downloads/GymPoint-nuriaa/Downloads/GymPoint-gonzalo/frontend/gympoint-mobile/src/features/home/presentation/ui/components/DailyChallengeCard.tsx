import styled from 'styled-components/native';
import { palette } from '@shared/styles';

const Container = styled.TouchableOpacity.attrs({ activeOpacity: 0.6 })`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid ${palette.borderSubtle};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const TitleSection = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const IconCircle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #fae8ff;
  align-items: center;
  justify-content: center;
`;

const IconText = styled.Text`
  font-size: 20px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${palette.textStrong};
  flex: 1;
`;

const Arrow = styled.Text`
  font-size: 18px;
  color: ${palette.textMuted};
`;

const ProgressContainer = styled.View`
  margin-bottom: 8px;
`;

const ProgressLabel = styled.Text`
  font-size: 14px;
  color: ${palette.textStrong};
  margin-bottom: 8px;
`;

const ProgressBarBackground = styled.View`
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.View<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background-color: #a855f7;
  border-radius: 4px;
`;

export default function DailyChallengeCard() {
  const progress = 33; // 1/3 completado

  return (
    <Container>
      <Header>
        <TitleSection>
          <IconCircle>
            <IconText>📅</IconText>
          </IconCircle>
          <Title>Desafío del día</Title>
        </TitleSection>
        <Arrow>›</Arrow>
      </Header>
      <ProgressContainer>
        <ProgressLabel>Entrena 3 grupos musculares</ProgressLabel>
        <ProgressBarBackground>
          <ProgressBarFill progress={progress} />
        </ProgressBarBackground>
      </ProgressContainer>
      <ProgressLabel style={{ fontSize: 12, color: palette.textMuted }}>
        Progreso: 1/3 completado
      </ProgressLabel>
    </Container>
  );
}
