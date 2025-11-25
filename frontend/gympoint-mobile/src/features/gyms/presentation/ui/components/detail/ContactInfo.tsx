import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

export const ContactInfo = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <View className="px-4 py-4">
      <View className="flex-row items-center mb-1.5">
        <Feather name="phone" size={16} color={isDark ? '#fff' : '#000'} />
        <Text className={isDark ? 'ml-2 text-textPrimary-dark' : 'ml-2 text-textPrimary'}>
          (011) 4567-8901
        </Text>
      </View>
      <View className="flex-row items-center mb-1.5">
        <Feather name="globe" size={16} color={isDark ? '#fff' : '#000'} />
        <Text className={isDark ? 'ml-2 text-textPrimary-dark' : 'ml-2 text-textPrimary'}>
          www.gympoint.com
        </Text>
      </View>
    </View>
  );
};
