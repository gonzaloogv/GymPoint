import { memo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Input } from './Input';

type Props = {
  title: string;
  searchText: string;
  onChangeSearch: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
};

export function SearchHeader({
  title,
  searchText,
  onChangeSearch,
  searchPlaceholder = 'Buscar...',
  children,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className="px-4 pt-0 pb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-lg font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
          {title}
        </Text>
        {children}
      </View>

      <View className="w-full">
        <Input
          placeholder={searchPlaceholder}
          value={searchText}
          onChangeText={onChangeSearch}
        />
      </View>
    </View>
  );
}
