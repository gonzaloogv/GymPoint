import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useTheme } from '@shared/hooks';
import { Avatar, TokenPill } from '@shared/components/ui';
import { palette } from '@shared/styles';

type Props = {
  userName: string;
  plan: 'Free' | 'Premium';
  tokens: number;
  streak?: number;
  onBellPress?: () => void;
};

export default function HomeHeader({ userName, plan, tokens, streak = 0, onBellPress }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const parts = (userName || '').trim().split(/\s+/);
  const firstName = parts[0] ?? userName ?? 'Usuario';

  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-1 flex-row items-center">
        <Avatar userName={userName} />
        <View className="ml-3">
          <Text className={`font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
            ¡Hola, {firstName}!
          </Text>
          <Text className={`mt-0.5 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            Usuario {plan}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 ml-3">
        <TokenPill value={tokens} />
        <View
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2'
          }}
        >
          <Text className="text-lg">🔥</Text>
          <Text className={`ml-1 font-semibold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
            {streak}
          </Text>
        </View>
      </View>
    </View>
  );
}
