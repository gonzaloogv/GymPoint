import { Text, View } from 'react-native';
import { useTheme } from '@shared/hooks';
import ListItem from '@shared/components/ui/ListItem';
import IndexBadge from '@shared/components/ui/IndexBadge';

type Props = {
  id: string | number;
  name: string;
  distancia?: number;
  address?: string;
  hours?: string;
  index: number;
  onPress?: (id: string | number) => void;
};

export function GymListItem({
  id,
  name,
  distancia,
  address,
  hours,
  index,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const formatDistance = (distance?: number) =>
    typeof distance === 'number' ? `${(distance / 1000).toFixed(1)} km` : '—';

  return (
    <ListItem
      onPress={() => onPress?.(id)}
      Left={<IndexBadge n={index + 1} />}
      Right={<Text className={isDark ? 'text-gray-600' : 'text-slate-400'}>{`>`}</Text>}
    >
      <Text className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>
        {name}
      </Text>
      <Text
        className={isDark ? 'text-gray-400 text-xs' : 'text-textSecondary text-xs'}
      >
        {formatDistance(distancia)} • {hours ?? '—'}
      </Text>
      {address && (
        <Text
          className={isDark ? 'text-gray-400 text-xs' : 'text-textSecondary text-xs'}
          numberOfLines={1}
        >
          {address}
        </Text>
      )}
    </ListItem>
  );
}
