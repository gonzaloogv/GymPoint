import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
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

  // Colores base
  const baseColors = {
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

  // Colores según tone
  const toneColors =
    tone === 'primary'
      ? {
          value: isDark ? '#C7D2FE' : '#4338CA',
          unit: isDark ? '#8B95F9' : '#4C51BF',
          iconColor: isDark ? '#C7D2FE' : '#4338CA',
        }
      : tone === 'success'
      ? {
          value: isDark ? '#6EE7B7' : '#047857',
          unit: isDark ? '#34D399' : '#047857',
          iconBackground: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.16)',
          iconBorder: isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.2)',
          iconColor: isDark ? '#6EE7B7' : '#047857',
        }
      : {};

  const colors = { ...baseColors, ...toneColors };

  // Tamaños según size
  const isCompact = size === 'compact';
  const borderRadius = isCompact ? 20 : 28;
  const padding = isCompact ? 'px-4 py-[14px]' : 'px-5 py-[18px]';
  const badgeSize = isCompact ? 44 : 56;
  const badgeRadius = isCompact ? 16 : 20;
  const labelFontSize = isCompact ? 11 : 12;
  const labelMargin = isCompact ? 6 : 8;
  const valueFontSize = isCompact ? 20 : 24;
  const unitFontSize = isCompact ? 13 : 16;

  // Sombras exactas preservadas
  const shadowStyle = highlight
    ? isDark
      ? {
          shadowColor: '#1F2937',
          shadowOpacity: 0.42,
          shadowOffset: { width: 0, height: 22 },
          shadowRadius: 30,
          elevation: 14,
        }
      : {
          shadowColor: '#4338CA',
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 16 },
          shadowRadius: 24,
          elevation: 8,
        }
    : isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 24,
        elevation: 10,
      }
    : {
        shadowColor: '#4F46E5',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 22,
        elevation: 5,
      };

  return (
    <View
      className={`border relative overflow-hidden ${padding}`}
      style={[
        {
          borderColor: colors.border,
          backgroundColor: colors.background,
          borderRadius,
        },
        shadowStyle,
        style,
      ]}
    >
      {highlight && (
        <>
          <View
            pointerEvents="none"
            className="absolute -top-14 -right-6 w-[164px] h-[164px] rounded-full opacity-50"
            style={{ backgroundColor: colors.glow }}
          />
          <View
            pointerEvents="none"
            className="absolute -top-9 -left-12 h-[120px] opacity-30"
            style={{
              backgroundColor: colors.sheen,
              width: '160%',
              transform: [{ rotate: '-12deg' }]
            }}
          />
        </>
      )}

      {(icon || trailingDecoration) && (
        <View className="flex-row items-center justify-between mb-3">
          {icon ? (
            wrapIcon ? (
              <View
                className="items-center justify-center border"
                style={{
                  borderColor: colors.iconBorder,
                  backgroundColor: colors.iconBackground,
                  width: badgeSize,
                  height: badgeSize,
                  borderRadius: badgeRadius,
                }}
              >
                {icon}
              </View>
            ) : (
              <View className="items-center justify-center" style={{ width: badgeSize, height: badgeSize }}>
                {icon}
              </View>
            )
          ) : (
            <View style={{ width: badgeSize }} />
          )}
          {trailingDecoration}
        </View>
      )}

      {label && (
        <Text
          className="font-semibold tracking-wider uppercase"
          style={{
            color: colors.label,
            fontSize: labelFontSize,
            marginBottom: labelMargin,
          }}
        >
          {label}
        </Text>
      )}

      {valueContent ? (
        <View className={children ? 'mb-[6px]' : ''}>
          {valueContent}
        </View>
      ) : (
        <View className="flex-row items-baseline gap-2">
          <Text className="font-bold" style={{ color: colors.value, fontSize: valueFontSize }}>
            {value}
          </Text>
          {unit && (
            <Text className="font-medium" style={{ color: colors.unit, fontSize: unitFontSize }}>
              {unit}
            </Text>
          )}
        </View>
      )}

      {children && <View className="mt-[18px]">{children}</View>}
    </View>
  );
};
