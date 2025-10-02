import React from 'react';
import styled from 'styled-components/native';
import { useTheme } from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

const BadgeContainer = styled.View<{ 
  $variant: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
  $size: 'small' | 'medium' | 'large';
}>`
  padding: ${({ theme, $size }) => {
    switch ($size) {
      case 'small': return `${theme.spacing(0.25)}px ${theme.spacing(0.75)}px`;
      case 'large': return `${theme.spacing(0.75)}px ${theme.spacing(1.5)}px`;
      default: return `${theme.spacing(0.5)}px ${theme.spacing(1)}px`;
    }
  }};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.muted;
      case 'outline': return 'transparent';
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      default: return theme.colors.muted;
    }
  }};
  border: 1px solid ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.border;
      case 'outline': return theme.colors.border;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      default: return theme.colors.border;
    }
  }};
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)}px;
`;

const BadgeText = styled.Text<{ 
  $variant: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
  $size: 'small' | 'medium' | 'large';
}>`
  color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary': return theme.colors.onPrimary;
      case 'secondary': return theme.colors.text;
      case 'outline': return theme.colors.text;
      case 'success': return theme.colors.onPrimary;
      case 'warning': return theme.colors.onPrimary;
      case 'danger': return theme.colors.onPrimary;
      default: return theme.colors.text;
    }
  }};
  font-size: ${({ theme, $size }) => {
    switch ($size) {
      case 'small': return theme.typography.small - 1;
      case 'large': return theme.typography.body;
      default: return theme.typography.small;
    }
  }}px;
  font-weight: 600;
`;

type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconColor?: string;
  iconSize?: number;
};

export function UnifiedBadge({ 
  children, 
  variant = 'secondary', 
  size = 'medium',
  icon,
  iconColor,
  iconSize = 12
}: Props) {
  const theme = useTheme();

  const getIconColor = () => {
    if (iconColor) return iconColor;
    
    switch (variant) {
      case 'primary':
      case 'success':
      case 'warning':
      case 'danger':
        return theme.colors.onPrimary;
      default:
        return theme.colors.subtext;
    }
  };

  return (
    <BadgeContainer $variant={variant} $size={size}>
      {icon && (
        <Feather
          name={icon as any}
          size={iconSize}
          color={getIconColor()}
        />
      )}
      <BadgeText $variant={variant} $size={size}>{children}</BadgeText>
    </BadgeContainer>
  );
}
