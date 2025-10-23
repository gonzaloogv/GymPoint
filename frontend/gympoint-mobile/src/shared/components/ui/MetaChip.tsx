import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = {
  children: React.ReactNode;
};

export function MetaChip({ children }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className={`px-2 py-1 rounded-md ${isDark ? 'bg-surface-dark' : 'bg-surfaceVariant'}`}>
      <Text className={`text-xs ${isDark ? 'text-text-dark' : 'text-text'}`}>{children}</Text>
    </View>
  );
}
