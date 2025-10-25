import React from 'react';
import { View } from 'react-native';
import { Card } from './Card';
import { MenuItem } from './MenuItem';

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
    <Card className="p-0 overflow-hidden">
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
    </Card>
  );
}
