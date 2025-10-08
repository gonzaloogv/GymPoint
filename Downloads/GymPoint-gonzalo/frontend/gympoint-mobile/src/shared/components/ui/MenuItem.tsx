import React from 'react';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

const MenuItemContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const MenuItemLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)}px;
  flex: 1;
`;

const MenuItemRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const MenuText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body}px;
  font-weight: 500;
`;

const MenuSubtext = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
  opacity: 0.6;
`;

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
};

export function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightComponent,
}: Props) {
  return (
    <MenuItemContainer onPress={onPress}>
      <MenuItemLeft>
        <Feather name={icon as any} size={18} color="#666" />
        <MenuText>{title}</MenuText>
      </MenuItemLeft>
      <MenuItemRight>
        {subtitle && <MenuSubtext>{subtitle}</MenuSubtext>}
        {rightComponent}
        {showChevron && <Feather name="chevron-right" size={16} color="#666" />}
      </MenuItemRight>
    </MenuItemContainer>
  );
}
