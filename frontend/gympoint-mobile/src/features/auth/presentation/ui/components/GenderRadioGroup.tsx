import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';
import { GENDER_OPTIONS } from '@shared/constants';

interface Props {
  value: string;
  onChange: (gender: string) => void;
  className?: string;
}

export const GenderRadioGroup: React.FC<Props> = ({
  value,
  onChange,
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labelColor = isDark ? 'text-text-dark' : 'text-text';

  return (
    <View className={`gap-3 ${className}`}>
      <View className="flex-row flex-wrap gap-x-4 gap-y-3">
        {GENDER_OPTIONS.map((option) => {
          const selected = value === option.value;

          const circleBase = 'w-5 h-5 rounded-full border-2 items-center justify-center';
          const circleSelected = 'bg-primary border-primary';
          const circleUnselected = isDark
            ? 'border-border-dark'
            : 'border-border';

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
              className="flex-row items-center gap-2 min-w-[45%]"
            >
              <View
                className={`${circleBase} ${
                  selected ? circleSelected : circleUnselected
                }`}
              >
                {selected && (
                  <View className="w-2 h-2 rounded-full bg-onPrimary" />
                )}
              </View>
              <Text className={`text-base ${labelColor}`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};