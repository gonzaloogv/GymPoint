import { View, Text } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useTheme } from '@shared/hooks';

type Props = {
  value: number;
  size?: number;
};

export function TokenPill({ value, size = 14 }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      className="flex-row items-center px-3 py-1.5 rounded-full"
      style={{
        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fff7ed'
      }}
    >
      <FeatherIcon
        name="zap"
        size={size}
        color={isDark ? '#FCD34D' : '#F59E0B'}
      />
      <Text className={`ml-1 font-semibold ${isDark ? 'text-yellow-400' : 'text-primary'}`}>
        {value}
      </Text>
    </View>
  );
}
