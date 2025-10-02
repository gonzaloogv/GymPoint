import styled from 'styled-components/native';
import { TouchableOpacity, Text, View } from 'react-native';

type ActionButtonProps = {
  $disabled?: boolean;
  $variant?: 'primary' | 'secondary';
};

export const ActionButton = styled(TouchableOpacity)<ActionButtonProps>`
  padding: 12px;
  border-radius: 8px;
  background-color: ${({ $disabled, $variant, theme }) =>
    $disabled
      ? theme.colors.disabledBg
      : $variant === 'secondary'
        ? theme.colors.bgSecondary
        : theme.colors.primary};
`;

export const ActionButtonText = styled(Text)<{ $variant?: 'primary' | 'secondary' }>`
  text-align: center;
  color: ${({ $variant }) => ($variant === 'secondary' ? '#000000' : '#ffffff')};
  font-weight: bold;
`;

export const CodeActions = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const IconButton = styled(TouchableOpacity)`
  padding: 4px;
`;
