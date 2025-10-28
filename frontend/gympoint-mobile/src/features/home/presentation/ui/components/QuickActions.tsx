import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { ActionCard } from '@shared/components/ui';
import { palette } from '@shared/styles';
import { useTheme } from '@shared/hooks';

type Props = { onFindGyms?: () => void; onMyRoutines?: () => void };

type QuickAction = {
  key: 'gyms' | 'routines' | 'progress' | 'rewards';
  label: string;
  description: string;
  icon: keyof typeof FeatherIcon.glyphMap;
  color: string;
  colorDark: string;
  background: string;
  backgroundDark: string;
  onPress: () => void;
};

export default function QuickActions({ onFindGyms, onMyRoutines }: Props) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const actions: QuickAction[] = [
    {
      key: 'gyms',
      label: 'Encontrar gym',
      description: 'Cerca de ti',
      icon: 'map-pin',
      color: palette.gymPrimary,
      colorDark: '#60a5fa',
      background: palette.overlayBlue,
      backgroundDark: 'rgba(96, 165, 250, 0.15)',
      onPress: onFindGyms ?? (() => navigation.navigate('Mapa')),
    },
    {
      key: 'routines',
      label: 'Mis rutinas',
      description: 'Entrenamientos',
      icon: 'activity',
      color: '#7c3aed',
      colorDark: '#a78bfa',
      background: '#ede9fe',
      backgroundDark: 'rgba(167, 139, 250, 0.15)',
      onPress: onMyRoutines ?? (() => navigation.navigate('Rutinas')),
    },
    {
      key: 'progress',
      label: 'Progreso',
      description: 'Ver estadísticas',
      icon: 'trending-up',
      color: '#059669',
      colorDark: '#4ade80',
      background: '#d1fae5',
      backgroundDark: 'rgba(74, 222, 128, 0.15)',
      onPress: () => navigation.navigate('Progreso'),
    },
    {
      key: 'rewards',
      label: 'Recompensas',
      description: 'Disponibles',
      icon: 'gift',
      color: '#d97706',
      colorDark: '#fb923c',
      background: '#fef3c7',
      backgroundDark: 'rgba(251, 146, 60, 0.15)',
      onPress: () => navigation.navigate('Progreso', { screen: 'Rewards' }),
    },
  ];

  return (
    <View className="w-full flex-wrap flex-row gap-2 justify-between">
      {actions.map(
        ({ key, label, description, icon, color, colorDark, background, backgroundDark, onPress }) => (
          <View key={key} className="w-[48%]">
            <ActionCard
              label={label}
              description={description}
              icon={icon}
              iconColor={isDark ? colorDark : color}
              iconBackground={isDark ? backgroundDark : background}
              onPress={onPress}
            />
          </View>
        ),
      )}
    </View>
  );
}
