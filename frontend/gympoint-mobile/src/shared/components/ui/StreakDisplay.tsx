import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  streak: number;
  size?: number;
  color?: string;
};

export function StreakDisplay({ streak, size = 16, color }: Props) {
  const iconColor = color || '#ea580c';

  return (
    <View className="flex-row items-center">
      <MaterialCommunityIcons name="fire" size={size} color={iconColor} />
      <Text className="ml-0.75 font-semibold" style={{ color: iconColor }}>
        Racha: {streak} días
      </Text>
    </View>
  );
}
