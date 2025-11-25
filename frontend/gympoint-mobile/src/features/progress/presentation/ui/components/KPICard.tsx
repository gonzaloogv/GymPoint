import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { MetricTile } from '@shared/components/ui';

interface KPICardProps {
  icon: React.ReactNode | keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  unit?: string;
}
export function KPICard({ icon, label, value, unit }: KPICardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const renderedIcon = useMemo(() => {
    if (!icon) {
      return null;
    }

    if (typeof icon === 'string') {
      return <Ionicons name={icon} size={28} color={isDark ? '#C7D2FE' : '#4338CA'} />;
    }

    return icon;
  }, [icon, isDark]);

  const dotColor = isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.25)';

  return (
    <View className="flex-1 mx-0.5">
      <MetricTile
        label={label}
        value={value}
        unit={unit}
        icon={renderedIcon ?? undefined}
        highlight
        tone="primary"
        trailingDecoration={<View style={[styles.dot, { backgroundColor: dotColor }]} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
  },
});
