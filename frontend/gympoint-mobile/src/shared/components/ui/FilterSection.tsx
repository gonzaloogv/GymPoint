import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  spaced?: boolean;
};

export function FilterSection({ title, icon, children, spaced = false }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={{ marginTop: spaced ? 16 : 0 }}>
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons
          name={icon}
          size={18}
          color={isDark ? '#F9FAFB' : '#111827'}
        />
        <Text
          className="font-semibold text-base"
          style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}
