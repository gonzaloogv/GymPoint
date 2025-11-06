import React, { useMemo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@shared/hooks';

type MetricTone = 'neutral' | 'primary' | 'success';
type MetricSize = 'regular' | 'compact';

type MetricTileProps = {
  label?: string;
  value?: string | number;
  valueContent?: React.ReactNode;
  unit?: string;
  icon?: React.ReactNode;
  wrapIcon?: boolean;
  tone?: MetricTone;
  size?: MetricSize;
  highlight?: boolean;
  trailingDecoration?: React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  valueContent,
  unit,
  icon,
  wrapIcon = true,
  tone = 'neutral',
  size = 'regular',
  highlight = false,
  trailingDecoration,
  children,
  style,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(() => {
    const base = {
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      label: isDark ? '#9CA3AF' : '#6B7280',
      value: isDark ? '#F9FAFB' : '#111827',
      unit: isDark ? '#6B7280' : '#4B5563',
      iconBackground: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.18)',
      iconBorder: isDark ? 'rgba(129, 140, 248, 0.38)' : 'rgba(129, 140, 248, 0.24)',
      iconColor: isDark ? '#C7D2FE' : '#4338CA',
      glow: isDark ? 'rgba(99, 102, 241, 0.28)' : 'rgba(79, 70, 229, 0.14)',
      sheen: isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(129, 140, 248, 0.12)',
    };

    switch (tone) {
      case 'primary':
        return {
          ...base,
          value: isDark ? '#C7D2FE' : '#4338CA',
          unit: isDark ? '#8B95F9' : '#4C51BF',
          iconColor: isDark ? '#C7D2FE' : '#4338CA',
        };
      case 'success':
        return {
          ...base,
          value: isDark ? '#6EE7B7' : '#047857',
          unit: isDark ? '#34D399' : '#047857',
          iconBackground: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.16)',
          iconBorder: isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.2)',
          iconColor: isDark ? '#6EE7B7' : '#047857',
        };
      default:
        return base;
    }
  }, [isDark, tone]);

  const radius = size === 'compact' ? 20 : 28;
  const paddingHorizontal = size === 'compact' ? 16 : 20;
  const paddingVertical = size === 'compact' ? 14 : 18;
  const badgeSize = size === 'compact' ? 44 : 56;
  const badgeRadius = size === 'compact' ? 16 : 20;

  const containerStyle = [
    styles.card,
    {
      borderColor: palette.border,
      backgroundColor: palette.background,
      borderRadius: radius,
      paddingHorizontal,
      paddingVertical,
    },
    highlight
      ? isDark
        ? styles.highlightDarkShadow
        : styles.highlightLightShadow
      : isDark
      ? styles.darkShadow
      : styles.lightShadow,
    style,
  ];

  const labelStyle = [
    styles.label,
    {
      color: palette.label,
      fontSize: size === 'compact' ? 11 : 12,
      marginBottom: size === 'compact' ? 6 : 8,
    },
  ];

  const valueStyle = [
    styles.value,
    {
      color: palette.value,
      fontSize: size === 'compact' ? 20 : 24,
    },
  ];

  const unitStyle = [
    styles.unit,
    {
      color: palette.unit,
      fontSize: size === 'compact' ? 13 : 16,
    },
  ];

  return (
    <View style={containerStyle}>
      {highlight ? (
        <>
          <View pointerEvents="none" style={[styles.highlightGlow, { backgroundColor: palette.glow }]} />
          <View pointerEvents="none" style={[styles.highlightSheen, { backgroundColor: palette.sheen }]} />
        </>
      ) : null}

      {(icon || trailingDecoration) && (
        <View style={styles.header}>
          {icon ? (
            wrapIcon ? (
              <View
                style={[
                  styles.iconBadge,
                  {
                    borderColor: palette.iconBorder,
                    backgroundColor: palette.iconBackground,
                    width: badgeSize,
                    height: badgeSize,
                    borderRadius: badgeRadius,
                  },
                ]}
              >
                {icon}
              </View>
            ) : (
              <View style={{ width: badgeSize, height: badgeSize, alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </View>
            )
          ) : (
            <View style={{ width: badgeSize }} />
          )}
          {trailingDecoration ? trailingDecoration : null}
        </View>
      )}

      {label ? <Text style={labelStyle}>{label}</Text> : null}

      {valueContent ? (
        <View style={[styles.customValue, !children && styles.customValueTight]}>
          {valueContent}
        </View>
      ) : (
        <View style={styles.valueRow}>
          <Text style={valueStyle}>{value}</Text>
          {unit ? <Text style={unitStyle}>{unit}</Text> : null}
        </View>
      )}

      {children ? <View style={styles.footer}>{children}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  value: {
    fontWeight: '700',
  },
  unit: {
    fontWeight: '500',
  },
  footer: {
    marginTop: 18,
  },
  customValue: {
    marginBottom: 6,
  },
  customValueTight: {
    marginBottom: 0,
  },
  highlightGlow: {
    position: 'absolute',
    top: -56,
    right: -24,
    width: 164,
    height: 164,
    borderRadius: 82,
    opacity: 0.5,
  },
  highlightSheen: {
    position: 'absolute',
    top: -36,
    left: -48,
    width: '160%',
    height: 120,
    opacity: 0.3,
    transform: [{ rotate: '-12deg' }],
  },
  lightShadow: {
    shadowColor: '#4F46E5',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 5,
  },
  darkShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 24,
    elevation: 10,
  },
  highlightLightShadow: {
    shadowColor: '#4338CA',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 24,
    elevation: 8,
  },
  highlightDarkShadow: {
    shadowColor: '#1F2937',
    shadowOpacity: 0.42,
    shadowOffset: { width: 0, height: 22 },
    shadowRadius: 30,
    elevation: 14,
  },
});
