import { View, Text } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useTheme } from '@shared/hooks';
import { UnifiedBadge } from './UnifiedBadge';
import { Row } from './Row';

type Props = {
  icon: keyof typeof FeatherIcon.glyphMap;
  title: string;
  badgeText?: string;
  badgeVariant?: 'secondary' | 'outline';
  iconColor?: string;
};

export function CardHeader({
  icon,
  title,
  badgeText,
  badgeVariant = 'secondary',
  iconColor,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const color = iconColor || (isDark ? '#FFFFFF' : '#1A1A1A');

  return (
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-1 flex-row items-center">
        <FeatherIcon name={icon} size={20} color={color} />
        <Text className={`ml-2 font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
          {title}
        </Text>
      </View>
      {badgeText && <UnifiedBadge variant={badgeVariant}>{badgeText}</UnifiedBadge>}
    </View>
  );
}
