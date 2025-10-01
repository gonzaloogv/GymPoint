import { View, Text, Pressable, ViewStyle, StyleProp } from 'react-native';
import styled from 'styled-components/native';
import { rad, font } from '@shared/styles';

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md';
};

const Root = styled(View)`
  flex-direction: row;
  align-self: flex-start; /* evita estirarse al máximo */
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
  background-color: ${({ theme }) => theme?.colors?.card ?? '#fff'};
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  overflow: hidden;
`;

const Item = styled(Pressable)<{ active?: boolean; size?: 'sm' | 'md' }>`
  padding-vertical: ${({ size }) => (size === 'sm' ? 6 : 8)}px;
  padding-horizontal: ${({ size }) => (size === 'sm' ? 12 : 14)}px;
  min-height: ${({ size }) => (size === 'sm' ? 32 : 36)}px;
  justify-content: center;
  align-items: center;
  background-color: ${({ active, theme }) =>
    active ? (theme?.colors?.primary ?? '#635BFF') : (theme?.colors?.card ?? '#fff')};
`;

const Label = styled(Text)<{ active?: boolean; size?: 'sm' | 'md' }>`
  color: ${({ active, theme }) => (active ? '#fff' : (theme?.colors?.text ?? '#111'))};
  font-weight: 600;
  font-size: ${({ size, theme }) =>
    size === 'sm' ? font(theme, 'small', 13) : font(theme, 'base', 14)}px;
`;

export function SegmentedControl({
  options,
  value,
  onChange,
  style,
  size = 'sm',
}: Props) {
  return (
    <Root style={style}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Item
            key={opt.value}
            active={active}
            size={size}
            onPress={() => onChange(opt.value)}
          >
            <Label active={active} size={size}>
              {opt.label}
            </Label>
          </Item>
        );
      })}
    </Root>
  );
}
