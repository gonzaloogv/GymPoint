import styled from 'styled-components/native';
import { Text } from 'react-native';
import { ListItem } from '@shared/components/ui';
import { IndexBadge } from '@shared/components/ui';
import { palette } from '@shared/styles';

const ItemTitle = styled(Text)`
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text ?? palette.textStrong};
`;

const ItemSubtitle = styled(Text)`
  color: ${({ theme }) => theme?.colors?.subtext ?? palette.textMuted};
  font-size: 12px;
`;

const ItemAddress = styled(Text)`
  color: ${({ theme }) => theme?.colors?.subtext ?? palette.textMuted};
  font-size: 12px;
`;

const RightArrow = styled(Text)`
  color: ${palette.slate400};
`;

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
  onPress 
}: Props) {
  const formatDistance = (distance?: number) =>
    typeof distance === 'number' ? `${(distance / 1000).toFixed(1)} km` : '—';

  return (
    <ListItem
      onPress={() => onPress?.(id)}
      Left={<IndexBadge n={index + 1} />}
      Right={<RightArrow>{'>'}</RightArrow>}
    >
      <ItemTitle>{name}</ItemTitle>
      <ItemSubtitle>
        {formatDistance(distancia)} • {hours ?? '—'}
      </ItemSubtitle>
      {address && <ItemAddress>{address}</ItemAddress>}
    </ListItem>
  );
}
