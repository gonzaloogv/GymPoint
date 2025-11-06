import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Ionicons } from '@expo/vector-icons';

interface KPICardProps {
  icon: React.ReactNode | keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  unit?: string;
}
export function KPICard({ icon, label, value, unit }: KPICardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = useMemo(
    () => ({
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
      glow: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.12)',
      sheen: isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(129, 140, 248, 0.15)',
      iconBackground: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.18)',
      iconBorder: isDark ? 'rgba(129, 140, 248, 0.42)' : 'rgba(129, 140, 248, 0.3)',
      iconColor: isDark ? '#C7D2FE' : '#4338CA',
      label: isDark ? '#9CA3AF' : '#6B7280',
      value: isDark ? '#F9FAFB' : '#111827',
      unit: isDark ? '#6B7280' : '#4B5563',
      dot: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.25)',
    }),
    [isDark],
  );

  const renderedIcon = useMemo(() => {
    if (!icon) {
      return null;
    }

    if (typeof icon === 'string') {
      return <Ionicons name={icon} size={28} color={palette.iconColor} />;
    }

    return icon;
  }, [icon, palette.iconColor]);

  return (
    <View className="flex-1 mx-0.5">
      <View
        className="rounded-3xl overflow-hidden"
        style={[
          styles.card,
          {
            backgroundColor: palette.background,
            borderColor: palette.border,
          },
          isDark ? styles.darkShadow : styles.lightShadow,
        ]}
      >
        <View pointerEvents="none" style={[styles.glow, { backgroundColor: palette.glow }]} />
        <View pointerEvents="none" style={[styles.sheen, { backgroundColor: palette.sheen }]} />
        <View style={styles.header}>
          {renderedIcon ? (
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: palette.iconBackground,
                  borderColor: palette.iconBorder,
                },
              ]}
            >
              {renderedIcon}
            </View>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
          <View style={[styles.dot, { backgroundColor: palette.dot }]} />
        </View>

        <View style={styles.body}>
          <Text style={[styles.label, { color: palette.label }]}>{label}</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: palette.value }]}>{value}</Text>
            {unit ? <Text style={[styles.unit, { color: palette.unit }]}>{unit}</Text> : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    position: 'relative',
  },
  lightShadow: {
    shadowColor: '#4F46E5',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 6,
  },
  darkShadow: {
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 26,
    elevation: 12,
  },
  glow: {
    position: 'absolute',
    top: -56,
    right: -24,
    width: 164,
    height: 164,
    borderRadius: 82,
    opacity: 0.5,
  },
  sheen: {
    position: 'absolute',
    top: -36,
    left: -48,
    width: '160%',
    height: 120,
    opacity: 0.3,
    transform: [{ rotate: '-12deg' }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 56,
    height: 56,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
  },
  body: {
    marginTop: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  unit: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
});
