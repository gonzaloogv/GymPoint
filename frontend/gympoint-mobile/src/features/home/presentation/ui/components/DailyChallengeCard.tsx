import styled from 'styled-components/native';
import { palette } from '@shared/styles';
import { DailyChallenge } from '../../../domain/entities/DailyChallenge';

type Props = {
  challenge?: DailyChallenge | null;
  onPress?: () => void;
};

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
  font-weight: 700;
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

const FooterText = styled.Text`
  font-size: 12px;
  color: ${palette.textMuted};
`;

export default function DailyChallengeCard({ challenge, onPress }: Props) {
  const hasChallenge = !!challenge;
  const current = challenge?.progress ?? 0;
  const target = challenge?.target ?? 0;
  const unit = challenge?.unit ? ` ${challenge.unit}` : '';
  const progressPct =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const title = hasChallenge ? challenge?.title : 'Sin desafio disponible';
  const description = hasChallenge
    ? challenge?.description
    : 'Revisa mas tarde para conocer tu reto diario.';

  return (
    <Container onPress={onPress} disabled={!onPress}>
      <Header>
        <TitleSection>
          <IconCircle>
            <IconText>DC</IconText>
          </IconCircle>
          <Title>Desafio del dia</Title>
        </TitleSection>
        <Arrow>{'>'}</Arrow>
      </Header>
      <ProgressContainer>
        <ProgressLabel numberOfLines={2}>{title}</ProgressLabel>
        <ProgressBarBackground>
          <ProgressBarFill progress={progressPct} />
        </ProgressBarBackground>
      </ProgressContainer>
      <FooterText>
        {hasChallenge
          ? `Progreso: ${current}/${target}${unit} | Recompensa: ${challenge?.reward ?? 0} tokens`
          : description}
      </FooterText>
    </Container>
  );
}

