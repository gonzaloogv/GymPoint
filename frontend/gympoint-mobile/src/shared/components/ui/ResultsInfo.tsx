import { Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = {
  count: number;
  hasUserLocation: boolean;
  itemName?: string;
  itemNamePlural?: string;
};

export function ResultsInfo({
  count,
  hasUserLocation,
  itemName = 'gimnasio',
  itemNamePlural = 'gimnasios',
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const plural = count !== 1;
  const itemLabel = plural ? itemNamePlural : itemName;
  const foundLabel = plural ? 'encontrados' : 'encontrado';
  const locationSuffix = hasUserLocation ? ' ordenados por distancia' : '';

  return (
    <Text className={`px-4 mt-0.75 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
      {count} {itemLabel} {foundLabel}
      {locationSuffix}
    </Text>
  );
}
