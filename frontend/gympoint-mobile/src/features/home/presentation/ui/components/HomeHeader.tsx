import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useTheme } from '@shared/hooks';
import { Avatar, TokenPill } from '@shared/components/ui';
import { palette } from '@shared/styles';

type Props = {
  userName: string;
  plan: 'Free' | 'Premium';
  tokens: number;
  onBellPress?: () => void;
};

export default function HomeHeader({ userName, plan, tokens, onBellPress }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const parts = userName.trim().split(/\s+/);
  const firstName = parts[0] ?? userName;

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

      <View className="flex-row items-center ml-3">
        <TokenPill value={tokens} />
        <TouchableOpacity
          onPress={onBellPress}
          className="ml-2 w-11 h-11 items-center justify-center"
        >
          <FeatherIcon name="bell" size={20} color={palette.textStrong} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
