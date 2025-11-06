import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type Layout = 'horizontal' | 'vertical';

type Props = {
  label: string;
  description: string;
  icon: keyof typeof FeatherIcon.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  spaced?: boolean;
  layout?: Layout;
};

export function ActionCard({
  label,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
  spaced = false,
  layout = 'horizontal',
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const spacedClass = spaced ? 'mr-3' : '';
  const isVertical = layout === 'vertical';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      label: isDark ? '#F9FAFB' : '#111827',
      description: isDark ? '#9CA3AF' : '#6B7280',
      chevron: isDark ? '#9CA3AF' : '#6B7280',
      haloBorder: isDark ? 'rgba(79, 70, 229, 0.36)' : 'rgba(129, 140, 248, 0.24)',
      haloBg: isDark ? 'rgba(79, 70, 229, 0.16)' : 'rgba(129, 140, 248, 0.14)',
    }),
    [isDark],
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      className={`flex-1 ${spacedClass}`}
      style={[
        styles.cardBase,
        isVertical ? styles.cardVertical : styles.cardHorizontal,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        isDark ? styles.darkShadow : styles.lightShadow,
      ]}
    >
      <View
        style={[
          styles.iconBadgeOuter,
          {
            borderColor: palette.haloBorder,
            backgroundColor: palette.haloBg,
          },
          isVertical ? styles.iconBadgeOuterVertical : styles.iconBadgeOuterHorizontal,
        ]}
      >
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: iconBackground,
            },
          ]}
        >
          <FeatherIcon name={icon} size={22} color={iconColor} />
        </View>
      </View>

      <View
        style={isVertical ? styles.contentVertical : styles.contentHorizontal}
      >
        <Text
          style={[
            styles.label,
            {
              color: palette.label,
              textAlign: isVertical ? 'center' : 'left',
            },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: palette.description,
              textAlign: isVertical ? 'center' : 'left',
            },
          ]}
        >
          {description}
        </Text>
      </View>

      {!isVertical && (
        <View style={styles.chevronWrapper}>
          <Ionicons name="chevron-forward" size={18} color={palette.chevron} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  cardHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardVertical: {
    alignItems: 'center',
  },
  lightShadow: {
    shadowColor: '#4338CA',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 5,
  },
  darkShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 22,
    elevation: 10,
  },
  iconBadgeOuter: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeOuterVertical: {
    marginBottom: 12,
  },
  iconBadgeOuterHorizontal: {
    marginRight: 16,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentHorizontal: {
    flex: 1,
    marginRight: 16,
  },
  contentVertical: {
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    marginTop: 4,
  },
  chevronWrapper: {
    marginLeft: 'auto',
  },
});
