import React from 'react';
import styled from 'styled-components/native';
import { Card } from './Card';
import { MenuItem } from './MenuItem';

const MenuContainer = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

type MenuOption = {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
};

type Props = {
  items: MenuOption[];
};

export function MenuList({ items }: Props) {
  return (
    <MenuContainer>
      {items.map((item, index) => (
        <MenuItem
          key={index}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          onPress={item.onPress}
          showChevron={item.showChevron}
          rightComponent={item.rightComponent}
        />
      ))}
    </MenuContainer>
  );
}
