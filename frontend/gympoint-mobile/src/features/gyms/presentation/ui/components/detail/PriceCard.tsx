import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

interface Props {
  price: number;
}

export const PriceCard = ({ price }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <View className={isDark ? 'bg-card-dark mx-3 my-3 p-4 rounded-xl' : 'bg-card mx-3 my-3 p-4 rounded-xl'}>
      <Text className={isDark ? 'text-base font-bold mb-1 text-textPrimary-dark' : 'text-base font-bold mb-1 text-textPrimary'}>
        Membresía Mensual
      </Text>
      <Text className="text-lg text-primary">
        ${price.toLocaleString('es-AR')}
      </Text>
    </View>
  );
};
