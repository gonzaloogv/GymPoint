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
      Right={<Text style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>{`>`}</Text>}
    >
      <Text
        className="font-semibold text-base"
        style={{ color: isDark ? '#F9FAFB' : '#111827' }}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text className="text-xs" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
        {formatDistance(distancia)} • {hours ?? '—'}
      </Text>
      {address && (
        <Text className="text-xs" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }} numberOfLines={1}>
          {address}
        </Text>
      )}
    </ListItem>
  );
}
