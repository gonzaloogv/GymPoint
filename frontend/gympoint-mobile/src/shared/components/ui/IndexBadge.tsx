import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = { n: number | string };

export function IndexBadge({ n }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      className="w-6.5 h-6.5 rounded-full items-center justify-center"
      style={{ backgroundColor: isDark ? '#FFFFFF' : '#1A1A1A' }}
    >
      <Text className="text-white font-bold text-xs" style={{ color: isDark ? '#000' : '#fff' }}>
        {n}
      </Text>
    </View>
  );
}

export default IndexBadge;
