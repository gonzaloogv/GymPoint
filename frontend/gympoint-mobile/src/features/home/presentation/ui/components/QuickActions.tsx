import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { ActionCard } from '@shared/components/ui';
import { palette } from '@shared/styles';

type Props = { onFindGyms?: () => void; onMyRoutines?: () => void };

type QuickAction = {
  key: 'gyms' | 'routines';
  label: string;
  description: string;
  icon: keyof typeof FeatherIcon.glyphMap;
  color: string;
  background: string;
  onPress: () => void;
};

export default function QuickActions({ onFindGyms, onMyRoutines }: Props) {
  const navigation = useNavigation<any>();

  const actions: QuickAction[] = [
    {
      key: 'gyms',
      label: 'Encontrar gym',
      description: 'Cerca de ti',
      icon: 'map-pin',
      color: palette.gymPrimary,
      background: palette.overlayBlue,
      onPress: onFindGyms ?? (() => navigation.navigate('Mapa')),
    },
    {
      key: 'routines',
      label: 'Mis rutinas',
      description: 'Entrenamientos',
      icon: 'activity',
      color: palette.lifestylePrimary,
      background: palette.overlayGreen,
      onPress: onMyRoutines ?? (() => navigation.navigate('Rutinas')),
    },
  ];

  return (
    <View className="w-full flex-row gap-2">
      {actions.map(
        ({ key, label, description, icon, color, background, onPress }, index) => (
          <ActionCard
            key={key}
            label={label}
            description={description}
            icon={icon}
            iconColor={color}
            iconBackground={background}
            onPress={onPress}
            spaced={index === 0}
          />
        ),
      )}
    </View>
  );
}
