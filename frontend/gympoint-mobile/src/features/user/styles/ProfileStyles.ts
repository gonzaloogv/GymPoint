/**
 * Estilos para los componentes del perfil de usuario
 * Utiliza styled-components/native
 */

import styled from 'styled-components/native';
import { AppTheme } from '@presentation/theme';

// ============================================
// CONTAINERS
// ============================================

export const Container = styled.ScrollView`
  flex: 1;
  background-color: ${(props: { theme: AppTheme }) => props.theme.colors.bg};
`;

export const ContentWrapper = styled.View`
  padding: ${(props: { theme: AppTheme }) => props.theme.spacing(2)}px;
`;

// ============================================
// CARDS
// ============================================

export const Card = styled.View`
  background-color: ${(props: { theme: AppTheme }) => props.theme.colors.card};
  border-radius: ${(props: { theme: AppTheme }) => props.theme.radius.md}px;
  padding: ${(props: { theme: AppTheme }) => props.theme.spacing(3)}px;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.spacing(2)}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

export const AlertCard = styled.View<{ purple?: boolean }>`
  background-color: ${(props) => (props.purple ? '#F3E8FF' : props.theme.colors.card)};
  border: 1px solid ${(props) => (props.purple ? '#C084FC' : props.theme.colors.border)};
  border-radius: ${(props: { theme: AppTheme }) => props.theme.radius.md}px;
  padding: ${(props: { theme: AppTheme }) => props.theme.spacing(2)}px;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.spacing(2)}px;
`;

export const GradientCard = styled.View`
  background-color: #f3e8ff;
  border: 1px solid #c084fc;
  border-radius: ${(props: { theme: AppTheme }) => props.theme.radius.md}px;
  padding: ${(props: { theme: AppTheme }) => props.theme.spacing(2)}px;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.spacing(2)}px;
`;

// ============================================
// AVATAR
// ============================================

export const AvatarContainer = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${(props: { theme: AppTheme }) => props.theme.colors.primary};
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

export const AvatarFallback = styled.Text`
  font-size: ${(props: { theme: AppTheme }) => props.theme.typography.h2}px;
  color: ${(props: { theme: AppTheme }) => props.theme.colors.primaryText};
  font-weight: bold;
`;

// ============================================
// BADGES
// ============================================

interface BadgeProps {
  theme: AppTheme;
  premium?: boolean;
  outline?: boolean;
}

export const Badge = styled.View<BadgeProps>`
  flex-direction: row;
  align-items: center;
  padding: ${(props) => props.theme.spacing(0.5)}px
    ${(props) => props.theme.spacing(1.5)}px;
  border-radius: ${(props) => props.theme.radius.sm}px;
  background-color: ${(props) => {
    if (props.premium) return '#9333EA';
    if (props.outline) return 'transparent';
    return props.theme.colors.muted;
  }};
  border: ${(props) =>
    props.outline ? `1px solid ${props.theme.colors.border}` : 'none'};
`;

interface BadgeTextProps {
  theme: AppTheme;
  premium?: boolean;
}

export const BadgeText = styled.Text<BadgeTextProps>`
  font-size: ${(props) => props.theme.typography.small}px;
  color: ${(props) => (props.premium ? '#FFFFFF' : props.theme.colors.text)};
  font-weight: 600;
`;

// ============================================
// BUTTONS
// ============================================

interface ButtonProps {
  theme: AppTheme;
  outline?: boolean;
  purple?: boolean;
  small?: boolean;
}

export const Button = styled.TouchableOpacity<ButtonProps>`
  background-color: ${(props) => {
    if (props.outline) return 'transparent';
    if (props.purple) return '#9333EA';
    return props.theme.colors.primary;
  }};
  border: ${(props) =>
    props.outline ? `2px solid ${props.theme.colors.danger}` : 'none'};
  border-radius: ${(props) => props.theme.radius.sm}px;
  padding: ${(props) =>
    props.small ? props.theme.spacing(1) : props.theme.spacing(1.5)}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

interface ButtonTextProps {
  theme: AppTheme;
  outline?: boolean;
  purple?: boolean;
  primary?: boolean;
  small?: boolean;
}

export const ButtonText = styled.Text<ButtonTextProps>`
  color: ${(props) => {
    if (props.outline) return props.theme.colors.danger;
    if (props.purple || props.primary) return '#FFFFFF';
    return props.theme.colors.text;
  }};
  font-size: ${(props) =>
    props.small ? props.theme.typography.small : props.theme.typography.body}px;
  font-weight: 600;
`;

// ============================================
// TEXT COMPONENTS
// ============================================

interface TitleProps {
  theme: AppTheme;
  large?: boolean;
}

export const Title = styled.Text<TitleProps>`
  font-size: ${(props) =>
    props.large ? props.theme.typography.h1 : props.theme.typography.h2}px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

export const Subtitle = styled.Text<{ theme: AppTheme }>`
  font-size: ${(props) => props.theme.typography.body}px;
  color: ${(props) => props.theme.colors.subtext};
  opacity: 0.6;
`;

export const BodyText = styled.Text<{ theme: AppTheme }>`
  font-size: ${(props) => props.theme.typography.body}px;
  color: ${(props) => props.theme.colors.text};
`;

interface SmallTextProps {
  theme: AppTheme;
  muted?: boolean;
}

export const SmallText = styled.Text<SmallTextProps>`
  font-size: ${(props) => props.theme.typography.small}px;
  color: ${(props) =>
    props.muted ? props.theme.colors.textMuted : props.theme.colors.text};
`;

// ============================================
// STATS
// ============================================

interface StatBoxProps {
  theme: AppTheme;
  color?: string;
}

export const StatBox = styled.View<StatBoxProps>`
  flex: 1;
  background-color: ${(props) => props.color || '#E3F2FD'};
  border-radius: ${(props) => props.theme.radius.sm}px;
  padding: ${(props) => props.theme.spacing(1.5)}px;
  align-items: center;
  justify-content: center;
  margin: ${(props) => props.theme.spacing(0.5)}px;
`;

interface StatValueProps {
  color?: string;
}

export const StatValue = styled.Text<StatValueProps>`
  font-size: 28px;
  font-weight: bold;
  color: ${(props) => props.color || '#1976D2'};
`;

interface StatLabelProps {
  color?: string;
}

export const StatLabel = styled.Text<StatLabelProps>`
  font-size: 11px;
  color: ${(props) => props.color || '#1976D2'};
  margin-top: 4px;
  text-align: center;
`;

// ============================================
// MENU ITEMS
// ============================================

export const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${(props: { theme: AppTheme }) => props.theme.spacing(2)}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props: { theme: AppTheme }) => props.theme.colors.border};
`;

export const MenuItemLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${(props: { theme: AppTheme }) => props.theme.spacing(1.5)}px;
`;

export const MenuItemRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${(props: { theme: AppTheme }) => props.theme.spacing(1)}px;
`;

// ============================================
// SWITCHES
// ============================================

export const SwitchRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${(props: { theme: AppTheme }) => props.theme.spacing(1.5)}px 0;
`;

export const SwitchRowLeft = styled.View`
  flex: 1;
`;

// ============================================
// SECTIONS
// ============================================

export const Section = styled.View`
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.spacing(3)}px;
`;

export const SectionTitle = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${(props: { theme: AppTheme }) => props.theme.spacing(1)}px;
  margin-bottom: ${(props: { theme: AppTheme }) => props.theme.spacing(1.5)}px;
`;