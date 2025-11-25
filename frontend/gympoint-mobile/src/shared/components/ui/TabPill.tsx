import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  focused: boolean;
  children: React.ReactNode;
  label: string;
  primaryColor: string;
  textMuted: string;
};

export function TabPill({ focused, children, label, primaryColor, textMuted }: Props) {
  return (
    <View className={`w-full items-center py-1 px-3 rounded-md ${
      focused ? 'bg-primary/10' : 'bg-transparent'
    }`}>
      {children}
      <Text
        className={`text-xs leading-3.5 mt-1 ${
          focused ? 'text-primary' : 'text-textMuted'
        }`}
        allowFontScaling={false}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
        {label}
      </Text>
    </View>
  );
}
