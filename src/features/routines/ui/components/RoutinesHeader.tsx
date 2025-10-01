import styled from 'styled-components/native';
import { FILTERS } from '../../hooks/useRoutinesFilters';
import { RoutineStatus } from '../../types';
import { Input } from '@shared/components/ui';

const Header = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.h1}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

const FiltersRow = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin-top: ${({ theme }) => theme.spacing(1)}px;
`;

const Chip = styled.TouchableOpacity<{ active?: boolean }>`
  padding: ${({ theme }) => theme.spacing(0.75)}px ${({ theme }) => theme.spacing(1.5)}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.card)};
  border: 1px solid
    ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.border)};
  margin-right: ${({ theme }) => theme.spacing(1)}px;
`;

const ChipText = styled.Text<{ active?: boolean }>`
  color: ${({ theme, active }) => (active ? theme.colors.onPrimary : theme.colors.text)};
  font-size: ${({ theme }) => theme.typography.small}px;
  font-weight: 600;
`;

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: 'All' | RoutineStatus;
  onStatusChange: (s: 'All' | RoutineStatus) => void;
};

export default function RoutinesHeader({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: Props) {
  return (
    <Header>
      <Title>Mis rutinas</Title>
      <Input
        placeholder="Buscar por nombre o músculo…"
        value={search}
        onChangeText={onSearchChange}
      />
      <FiltersRow>
        {FILTERS.map(({ key, label }) => {
          const active = key === status;
          return (
            <Chip key={key} active={active} onPress={() => onStatusChange(key)}>
              <ChipText active={active}>{label}</ChipText>
            </Chip>
          );
        })}
      </FiltersRow>
    </Header>
  );
}
