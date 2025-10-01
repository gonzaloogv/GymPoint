// src/features/rewards/ui/styles.ts

import styled from 'styled-components/native';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

// --- Contenedores y Layout General ---

export const ScrollContainer = styled(ScrollView)`
  flex: 1;
  background-color: ${(props) => props.theme.colors.bg};
  padding: 0 16px;
`;

export const Container = styled(View)`
  flex: 1;
  background-color: ${(props) => props.theme.colors.bg};
  padding-bottom: 24px;
`;

export const HeaderWrapper = styled(View)`
  padding: 16px 0;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const HeaderTitle = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

export const HeaderSubtitle = styled(Text)`
  font-size: 14px;
  color: ${(props) => props.theme.colors.textMuted};
`;

// --- Tokens Display ---

export const TokenDisplay = styled(View)`
  align-items: flex-end;
`;

export const TokenWrapper = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
`;

export const TokenText = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

export const TokenLabel = styled(Text)`
  font-size: 10px;
  color: ${(props) => props.theme.colors.textMuted};
  text-align: right;
`;

// --- Pestañas (Tabs) ---

export const TabsContainer = styled(View)`
  width: 100%;
  margin-bottom: 16px;
`;

export const TabsList = styled(View)`
  flex-direction: row;
  background-color: ${(props) => props.theme.colors.bgSecondary};
  border-radius: 8px;
  padding: 4px;
`;

interface TabButtonProps {
  isActive: boolean;
}

export const TabsTrigger = styled(TouchableOpacity)<TabButtonProps>`
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.primary : 'transparent'};
`;

export const TabsTriggerText = styled(Text)<TabButtonProps>`
  text-align: center;
  font-weight: 600;
  color: ${({ isActive, theme }) => (isActive ? '#FFFFFF' : theme.colors.textMuted)};
`;

export const TabsContent = styled(View)`
  padding-top: 16px;
`;

// --- Card de Recompensa ---

interface RewardCardProps {
  isAffordable: boolean;
  isAvailable: boolean;
}

export const RewardCard = styled(View)<RewardCardProps>`
  background-color: ${(props) => props.theme.colors.cardBg};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  opacity: ${({ isAvailable }) => (isAvailable ? 1 : 0.5)};
  border-width: 1px;
  border-color: ${({ isAffordable, theme }) =>
    isAffordable ? theme.colors.successBorder : theme.colors.border};
`;

export const RewardCardContent = styled(View)`
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
`;

export const RewardIcon = styled(View)`
  width: 48px;
  height: 48px;
  background-color: ${(props) => props.theme.colors.bgSecondary};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

export const RewardIconText = styled(Text)`
  font-size: 24px;
`;

export const RewardInfo = styled(View)`
  flex: 1;
`;

export const RewardTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
`;

export const RewardDescription = styled(Text)`
  font-size: 13px;
  color: ${(props) => props.theme.colors.textMuted};
  margin-bottom: 8px;
`;

// --- Costo y Categoría ---

export const RewardCost = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
`;

export const CostText = styled(Text)`
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`;

export const BadgeWrapper = styled(View)`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
`;

interface CategoryBadgeProps {
  color: string;
}

export const CategoryBadge = styled(View)<CategoryBadgeProps>`
  padding: 4px 8px;
  border-radius: 10px;
  background-color: ${(props) => props.color};
`;

export const CategoryBadgeText = styled(Text)`
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
`;

export const TermsText = styled(Text)`
  font-size: 11px;
  color: ${(props) => props.theme.colors.textMuted};
  margin-bottom: 12px;
`;

// --- Botón de Acción ---

interface ButtonProps {
  disabled?: boolean;
}

export const ActionButton = styled(TouchableOpacity)<ButtonProps>`
  padding: 12px;
  border-radius: 8px;
  background-color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabledBg : theme.colors.primary};
`;

export const ActionButtonText = styled(Text)`
  text-align: center;
  color: #ffffff;
  font-weight: bold;
`;

// --- Mis Códigos ---

export const CodeSectionTitle = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
  margin-top: 24px;
  margin-bottom: 12px;
`;

export const CodeBox = styled(View)`
  background-color: ${(props) => props.theme.colors.bgSecondary};
  padding: 12px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const CodeText = styled(Text)`
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
`;

export const CodeCopyButton = styled(TouchableOpacity)`
  padding: 8px 12px;
  background-color: ${(props) => props.theme.colors.primary};
  border-radius: 6px;
`;

export const CodeCopyText = styled(Text)`
  color: #ffffff;
  font-weight: 600;
`;
