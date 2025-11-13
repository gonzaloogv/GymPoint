import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { useTheme } from '@shared/hooks';
import { Card } from './Card';
import { palette } from '@shared/styles';

type Props = {
  visible: boolean;
  variant: 'warning' | 'premium' | 'info';
  icon: keyof typeof FeatherIcon.glyphMap;
  title: string;
  description: string;
  buttonText: string;
  onButtonPress: () => void;
};

const getVariantStyles = (variant: 'warning' | 'premium' | 'info') => {
  switch (variant) {
    case 'warning':
      return {
        borderColor: palette.warningBorder,
        bgColor: palette.warningSurface,
        titleColor: palette.warningStrong,
        descColor: palette.warningText,
        iconColor: palette.warningIcon,
      };
    case 'premium':
      return {
        borderColor: palette.premiumBorder,
        bgColor: palette.premiumSurface,
        titleColor: palette.premiumStrong,
        descColor: palette.premiumText,
        iconColor: palette.premiumIcon,
      };
    case 'info':
      return {
        borderColor: palette.infoBorder,
        bgColor: palette.infoSurface,
        titleColor: palette.infoStrong,
        descColor: palette.info,
        iconColor: palette.info,
      };
    default:
      return {
        borderColor: palette.neutralBorder,
        bgColor: palette.surfaceMuted,
        titleColor: palette.textStrong,
        descColor: palette.textMuted,
        iconColor: palette.textMuted,
      };
  }
};

export function BannerCard({
  visible,
  variant,
  icon,
  title,
  description,
  buttonText,
  onButtonPress,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getVariantStyles(variant);

  if (!visible) return null;

  return (
    <Card
      className="border-2"
      style={{ borderColor: styles.borderColor, backgroundColor: styles.bgColor }}
    >
      <View className="flex-row items-start gap-4">
        <FeatherIcon name={icon} size={20} color={styles.iconColor} className="mt-1" />
        <View className="flex-1">
          <Text className="mb-0.5 font-semibold text-sm" style={{ color: styles.titleColor }}>
            {title}
          </Text>
          <Text className="mb-3 text-sm" style={{ color: styles.descColor }}>
            {description}
          </Text>
          <TouchableOpacity
            onPress={onButtonPress}
            className="rounded-lg border items-center justify-center py-2 px-3"
            style={{ borderColor: isDark ? '#444' : '#ddd' }}
          >
            <Text
              className="font-semibold text-sm"
              style={{ color: isDark ? '#fff' : '#000' }}
            >
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}
