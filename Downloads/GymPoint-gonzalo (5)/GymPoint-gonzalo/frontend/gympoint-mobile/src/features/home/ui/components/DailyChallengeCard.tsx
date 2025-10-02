import styled from 'styled-components/native';
import { BannerCard } from '@shared/components/ui';

const Container = styled.TouchableOpacity.attrs({ activeOpacity: 0.6 })`
  flex: 1;
`;

export default function DailyChallengeCard() {
  return (
    <Container>
      <BannerCard
        visible={true}
        variant="info"
        icon="award"
        title="Desafío de hoy"
        description="Completá 30 minutos de ejercicio y ganá 15 tokens extra"
        buttonText="Ver desafío"
        onButtonPress={() => {}}
      />
    </Container>
  );
}
