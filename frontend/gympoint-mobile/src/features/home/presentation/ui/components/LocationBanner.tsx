import { BannerCard } from '@shared/components/ui';

type Props = { visible: boolean; onEnable: () => void };

export default function LocationBanner({ visible, onEnable }: Props) {
  return (
    <BannerCard
      visible={visible}
      variant="warning"
      icon="map-pin"
      title="Activar ubicación"
      description="Permitinos acceder a tu ubicación para encontrar gimnasios cercanos"
      buttonText="Activar ubicación"
      onButtonPress={onEnable}
    />
  );
}
