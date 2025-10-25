import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useTheme } from '@shared/hooks';
import { Card } from './Card';
import { Circle } from './Circle';

type Props = {
  label: string;
  description: string;
  icon: keyof typeof FeatherIcon.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  spaced?: boolean;
};

export function ActionCard({
  label,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
  spaced = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const spacedClass = spaced ? 'mr-3' : '';

  return (
    <Card className={`flex-1 items-center py-4 ${spacedClass}`}>
      <TouchableOpacity onPress={onPress} className="flex-1 items-center" activeOpacity={0.6}>
        <Circle size={48} backgroundColor={iconBackground} className="mb-2">
          <FeatherIcon name={icon} size={24} color={iconColor} />
        </Circle>
        <Text className={`mb-0.5 font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
          {label}
        </Text>
        <Text className={isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}>
          {description}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}
