import React from 'react';
import styled from 'styled-components/native';
import { Modal, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { rad, sp } from '@shared/styles';

const SheetOverlay = styled(Modal).attrs({ transparent: true, animationType: 'fade' })``;

const SheetContainer = styled(View)`
  flex: 1;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.25);
`;

const Backdrop = styled(TouchableOpacity).attrs({ activeOpacity: 1 })`
  flex: 1;
`;

const SheetBody = styled(View)`
  max-height: 70%;
  background-color: ${({ theme }) => theme.colors.card};
  border-top-left-radius: ${({ theme }) => rad(theme, 'lg', 16)}px;
  border-top-right-radius: ${({ theme }) => rad(theme, 'lg', 16)}px;
  padding: ${({ theme }) => sp(theme, 2)}px;
`;

const ContentScroll = styled(ScrollView).attrs(({ theme }) => ({
  contentContainerStyle: { paddingBottom: theme.spacing(1.5) },
}))``;

const SheetTitle = styled(Text)`
  font-weight: 700;
  font-size: ${({ theme }) => theme.typography.body}px;
  margin-bottom: ${({ theme }) => theme.spacing(1)}px;
  color: ${({ theme }) => theme.colors.text};
`;

const SheetActions = styled(View)`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1.25)}px;
  margin-top: ${({ theme }) => theme.spacing(1.5)}px;
`;

const OutlineButton = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: ${({ theme }) => theme.spacing(5)}px;
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const SolidButton = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: ${({ theme }) => theme.spacing(5)}px;
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const ButtonText = styled(Text)<{ $solid?: boolean }>`
  color: ${({ theme, $solid }) => ($solid ? theme.colors.onPrimary : theme.colors.text)};
  font-weight: 600;
`;

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  onClear?: () => void;
  onApply?: () => void;
  clearLabel?: string;
  applyLabel?: string;
  children: React.ReactNode;
};

export function FilterSheet({
  visible,
  onClose,
  title,
  onClear,
  onApply,
  clearLabel = 'Limpiar',
  applyLabel = 'Aplicar',
  children,
}: Props) {
  return (
    <SheetOverlay visible={visible} onRequestClose={onClose}>
      <SheetContainer>
        <Backdrop onPress={onClose} />
        <SheetBody>
          <SheetTitle>{title}</SheetTitle>

          <ContentScroll>
            {children}

            <SheetActions>
              <OutlineButton onPress={onClear}>
                <ButtonText>{clearLabel}</ButtonText>
              </OutlineButton>
              <SolidButton onPress={onApply}>
                <ButtonText $solid>{applyLabel}</ButtonText>
              </SolidButton>
            </SheetActions>
          </ContentScroll>
        </SheetBody>
      </SheetContainer>
    </SheetOverlay>
  );
}
