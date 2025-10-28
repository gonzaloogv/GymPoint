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

  const itemPadding = size === 'sm' ? 'px-3 py-1.5' : 'px-3.5 py-2';
  const itemHeight = size === 'sm' ? 'min-h-8' : 'min-h-9';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const computedStyle = StyleSheet.flatten([
    {
      borderColor: isDark ? '#2C3444' : '#DDDDDD',
      backgroundColor: isDark ? '#252B3D' : '#FFFFFF',
    },
    style,
  ]);

  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: computedStyle.borderColor,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: computedStyle.backgroundColor,
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
              backgroundColor: active ? '#4A9CF5' : isDark ? '#252B3D' : '#FFFFFF',
              flexWrap: 'nowrap',
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontWeight: '600',
                fontSize: size === 'sm' ? 12 : 13,
                color: active ? '#FFFFFF' : isDark ? '#6B7280' : '#1A1A1A',
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
