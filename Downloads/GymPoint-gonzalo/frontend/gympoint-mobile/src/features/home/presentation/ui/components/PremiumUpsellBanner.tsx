import { BannerCard } from '@shared/components/ui';

type Props = { visible: boolean; onPress?: () => void };

export default function PremiumUpsellBanner({ visible, onPress }: Props) {
  return (
    <BannerCard
      visible={visible}
      variant="premium"
      icon="zap"
      title="Upgrade a Premium"
      description="Accedé a rutinas personalizadas, métricas avanzadas y más recompensas"
      buttonText="Ver planes"
      onButtonPress={onPress || (() => {})}
    />
  );
}
