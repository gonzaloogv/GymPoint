import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
          className="font-semibold text-base mb-3"
          style={{
            color: isDark ? '#F9FAFB' : '#111827',
            letterSpacing: -0.2,
            marginTop: spaced ? 16 : 0,
          }}
        >
          {title}
        </Text>
      )}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = isActive(option);

          const shadowStyle = active
            ? isDark
              ? {
                  shadowColor: '#4A9CF5',
                  shadowOpacity: 0.3,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 3,
                }
              : {
                  shadowColor: '#4A9CF5',
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 3,
                }
            : {};

          const chipStyle = StyleSheet.flatten([
            {
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              backgroundColor: active ? '#4A9CF5' : isDark ? '#1F2937' : '#ffffff',
              borderColor: active ? '#4A9CF5' : isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
            },
            shadowStyle,
          ]);

          return (
            <TouchableOpacity
              key={option}
              onPress={() => {
                console.log('🎯 ChipSelector - onToggle called:', option);
                onToggle(option);
              }}
              style={chipStyle}
            >
              <Text
                className="font-semibold text-sm"
                style={{
                  color: active ? '#FFFFFF' : isDark ? '#F9FAFB' : '#111827',
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
