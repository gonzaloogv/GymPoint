import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = {
  title?: string;
  options: readonly string[];
  isActive: (value: string) => boolean;
  onToggle: (value: string) => void;
  spaced?: boolean;
};

export function ChipSelector({
  title,
  options,
  isActive,
  onToggle,
  spaced = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {title && (
        <Text
          className={`font-semibold ${spaced ? 'mt-4 mb-2' : 'mb-2'} ${isDark ? 'text-text-dark' : 'text-text'}`}
        >
          {title}
        </Text>
      )}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = isActive(option);
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onToggle(option)}
              className="px-4 py-2 rounded-md border"
              style={{
                backgroundColor: active ? '#4A9CF5' : isDark ? '#252B3D' : '#FFFFFF',
                borderColor: active ? '#4A9CF5' : isDark ? '#2C3444' : '#DDDDDD',
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{
                  color: active ? '#FFFFFF' : isDark ? '#FFFFFF' : '#1A1A1A',
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
