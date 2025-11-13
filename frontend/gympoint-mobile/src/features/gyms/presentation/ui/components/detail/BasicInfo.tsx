import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Gym } from '@features/gyms/domain/entities/Gym';
import { useTheme } from '@shared/hooks';

interface Props {
  gym: Gym;
}

export const BasicInfo = ({ gym }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className="px-4 py-4">
      <Text className="text-xl font-bold" numberOfLines={1}>
        {gym.name}
      </Text>
      <View className="flex-row items-center mt-1">
        <Feather name="map-pin" size={16} color="#666" />
        <Text
          className={isDark ? 'text-textPrimary-dark text-sm ml-1.5' : 'text-textPrimary text-sm ml-1.5'}
          numberOfLines={1}
        >
          {gym.address || 'Sin dirección'}
          {gym.distancia && ` • ${(gym.distancia / 1000).toFixed(1)} km`}
        </Text>
      </View>
    </View>
  );
};
