import { View, Text, Pressable, ViewStyle, StyleProp } from 'react-native';
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

  return (
    <View
      className="flex-row self-center border rounded-md overflow-hidden"
      style={{
        borderColor: isDark ? '#2C3444' : '#DDDDDD',
        backgroundColor: isDark ? '#252B3D' : '#FFFFFF',
        ...style,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`${itemPadding} ${itemHeight} justify-center items-center flex-1`}
            style={{
              backgroundColor: active ? '#4A9CF5' : isDark ? '#252B3D' : '#FFFFFF',
            }}
          >
            <Text
              className={`font-semibold ${fontSize}`}
              style={{ color: active ? '#FFFFFF' : isDark ? '#FFFFFF' : '#1A1A1A' }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
