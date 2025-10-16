import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { rad } from '@shared/styles';

const ChipsGrid = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled(TouchableOpacity)<{ $active?: boolean }>`
  padding: 10px 16px;
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active
      ? (theme?.colors?.primary ?? '#635BFF')
      : (theme?.colors?.border ?? '#e5e7eb')};
  background-color: ${({ theme, $active }) =>
    $active ? (theme?.colors?.primary ?? '#635BFF') : (theme?.colors?.card ?? '#fff')};
`;

const ChipText = styled(Text)<{ $active?: boolean }>`
  color: ${({ theme, $active }) => ($active ? '#fff' : (theme?.colors?.text ?? '#111'))};
  font-weight: 600;
  font-size: 14px;
`;

const SectionTitle = styled(Text)<{ $spaced?: boolean }>`
  font-weight: 600;
  margin: ${({ $spaced }) => ($spaced ? '16px 0 8px' : '0 0 8px')};
`;

type Props = {
  title?: string;
  options: readonly string[];
  isActive: (value: string) => boolean;
  onToggle: (value: string) => void;
  spaced?: boolean;
};

export function ChipSelector({
  title,
  options,
  isActive,
  onToggle,
  spaced = false,
}: Props) {
  return (
    <>
      {title && <SectionTitle $spaced={spaced}>{title}</SectionTitle>}
      <ChipsGrid>
        {options.map((option) => {
          const active = isActive(option);
          return (
            <Chip key={option} $active={active} onPress={() => onToggle(option)}>
              <ChipText $active={active}>{option}</ChipText>
            </Chip>
          );
        })}
      </ChipsGrid>
    </>
  );
}
