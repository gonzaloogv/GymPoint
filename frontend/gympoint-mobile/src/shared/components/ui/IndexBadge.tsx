import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = { n: number | string };

export function IndexBadge({ n }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      className={`w-7 h-7 rounded-full items-center justify-center ${
        isDark ? 'bg-white' : 'bg-black'
      }`}
    >
      <Text
        className={`font-bold text-xs ${isDark ? 'text-black' : 'text-white'}`}
      >
        {n}
      </Text>
    </View>
  );
}

export default IndexBadge;
