import { View, Text, Pressable, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md';
};

export function SegmentedControl({
  options,
  value,
  onChange,
  style,
  size = 'sm',
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores estandarizados
  const borderColor = isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB';
  const backgroundColor = isDark ? '#111827' : '#ffffff';
  const activeBackgroundColor = '#4A9CF5'; // Color primario para el estado activo
  const activeTextColor = '#ffffff';
  const inactiveTextColor = isDark ? '#9CA3AF' : '#6B7280';

  const itemPadding = size === 'sm' ? 'px-3 py-1.5' : 'px-3.5 py-2';
  const itemHeight = size === 'sm' ? 'min-h-8' : 'min-h-9';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 2,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
      };

  const computedStyle = StyleSheet.flatten([
    {
      borderColor,
      backgroundColor,
    },
    shadowStyle,
    style,
  ]);

  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: computedStyle.borderColor,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: computedStyle.backgroundColor,
        ...shadowStyle,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              paddingHorizontal: size === 'sm' ? 8 : 12,
              paddingVertical: size === 'sm' ? 6 : 10,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: active ? activeBackgroundColor : backgroundColor,
              flexWrap: 'nowrap',
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontWeight: '600',
                fontSize: size === 'sm' ? 12 : 13,
                color: active ? activeTextColor : inactiveTextColor,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
