import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface Props {
  services: string[];
}

export const Services = ({ services }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const icons: Record<string, string> = {
    Pesas: 'activity',
    WiFi: 'wifi',
    Cafetería: 'coffee',
    Agua: 'droplet',
  };

  return (
    <View className="px-4 py-4">
      <Text className={isDark ? 'text-base font-bold mb-2 text-textPrimary-dark' : 'text-base font-bold mb-2 text-textPrimary'}>
        Servicios
      </Text>
      <View className="flex-row flex-wrap">
        {services.map((s) => (
          <View key={s} className="flex-row items-center mr-3 mb-1.5">
            <Feather name={(icons[s] as any) || 'check'} size={16} color={isDark ? '#fff' : '#000'} />
            <Text className={isDark ? 'ml-1 text-sm text-textPrimary-dark' : 'ml-1 text-sm text-textPrimary'}>
              {s}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
