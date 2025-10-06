import styled from 'styled-components/native';
import { Modal, ScrollView, TouchableOpacity, View, Text } from 'react-native';

import { rad, sp } from '@shared/styles';

export const SheetOverlay = styled(Modal).attrs({
  transparent: true,
  animationType: 'fade',
})``;

export const SheetContainer = styled(View)`
  flex: 1;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.25);
`;

export const Backdrop = styled(TouchableOpacity).attrs({ activeOpacity: 1 })`
  flex: 1;
`;

export const SheetBody = styled(View)`
  max-height: 70%;
  background-color: ${({ theme }) => theme?.colors?.card ?? '#fff'};
  border-top-left-radius: ${({ theme }) => rad(theme, 'lg', 16)}px;
  border-top-right-radius: ${({ theme }) => rad(theme, 'lg', 16)}px;
  padding: ${({ theme }) => sp(theme, 2)}px;
`;

export const ContentScroll = styled(ScrollView).attrs({
  contentContainerStyle: { paddingBottom: 12 },
})``;

export const SheetTitle = styled(Text)`
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 8px;
`;

export const SectionTitle = styled(Text)<{ $spaced?: boolean }>`
  font-weight: 600;
  margin: ${({ $spaced }) => ($spaced ? '16px 0 8px' : '0 0 8px')};
`;

export const ChipsGrid = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Chip = styled(TouchableOpacity)<{ $active?: boolean }>`
  padding: 8px 12px;
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active
      ? (theme?.colors?.primary ?? '#635BFF')
      : (theme?.colors?.border ?? '#e5e7eb')};
  background-color: ${({ theme, $active }) =>
    $active ? (theme?.colors?.primary ?? '#635BFF') : (theme?.colors?.bg ?? '#fafafa')};
`;

export const ChipText = styled(Text)<{ $active?: boolean }>`
  color: ${({ theme, $active }) => ($active ? '#fff' : (theme?.colors?.text ?? '#111'))};
  font-weight: 600;
`;

export const SheetActions = styled(View)`
  flex-direction: row;
  gap: 10px;
  margin-top: 12px;
`;

export const OutlineButton = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
`;

export const SolidButton = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  background-color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
`;

export const ButtonText = styled(Text)<{ $solid?: boolean }>`
  color: ${({ $solid }) => ($solid ? '#fff' : '#111')};
  font-weight: 600;
`;

export const SectionHeader = styled(View)`
  margin-top: 16px;
`;
