import { View, Text } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';

type Props = {
  value: number;
  size?: number;
};

export function TokenPill({ value, size = 14 }: Props) {
  return (
    <View className="flex-row items-center px-2 py-1 rounded-full" style={{ backgroundColor: '#fff7ed' }}>
      <FeatherIcon name="zap" size={size} color="#F59E0B" />
      <Text className="ml-1 font-semibold text-primary">{value}</Text>
    </View>
  );
}
