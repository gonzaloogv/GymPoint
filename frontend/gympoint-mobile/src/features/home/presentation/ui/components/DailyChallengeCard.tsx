import { TouchableOpacity } from 'react-native';
import { BannerCard } from '@shared/components/ui';

export default function DailyChallengeCard() {
  return (
    <TouchableOpacity activeOpacity={0.6} className="flex-1">
      <BannerCard
        visible={true}
        variant="info"
        icon="award"
        title="Desafío de hoy"
        description="Completá 30 minutos de ejercicio y ganá 15 tokens extra"
        buttonText="Ver desafío"
        onButtonPress={() => {}}
      />
    </TouchableOpacity>
  );
}
