import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Card, Circle, Row } from '@shared/components/ui';
import { palette } from '@shared/styles';

const Container = styled.TouchableOpacity.attrs({ activeOpacity: 0.6 })`
  flex: 1;
`;

const ChallengeCard = styled(Card)`
  border-color: ${palette.infoBorder};
  background-color: ${palette.infoSurface};
`;

const ChallengeContent = styled(Row)`
  align-items: center;
`;

const ChallengeCopy = styled.View`
  flex: 1;
  margin: 0 12px;
`;

const Title = styled.Text`
  margin-bottom: 2px;
  font-weight: 700;
  color: ${palette.infoStrong};
`;

const Description = styled.Text`
  color: ${palette.info};
`;

export default function DailyChallengeCard() {
  return (
    <Container>
      <ChallengeCard>
        <ChallengeContent>
          <Circle $background={palette.info}>
            <FeatherIcon name="award" size={20} color="#fff" />
          </Circle>
          <ChallengeCopy>
            <Title>Desafío de hoy</Title>
            <Description>
              Completá 30 minutos de ejercicio y ganá 15 tokens extra
            </Description>
          </ChallengeCopy>
          <FeatherIcon name="chevron-right" size={18} color={palette.info} />
        </ChallengeContent>
      </ChallengeCard>
    </Container>
  );
}
