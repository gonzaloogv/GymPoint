import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

interface Props {
  name: string;
  onBack: () => void;
}

export const Header = ({ name, onBack }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <View className="flex-row items-center p-3">
      <TouchableOpacity onPress={onBack} className="pr-2">
        <Feather name="arrow-left" size={24} color={isDark ? '#fff' : '#000'} />
      </TouchableOpacity>
      <Text className={isDark ? 'text-lg font-bold text-textPrimary-dark' : 'text-lg font-bold text-textPrimary'} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};
