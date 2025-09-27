import styled from 'styled-components/native';
import { View, Text, TouchableOpacity, Image, TouchableOpacityProps } from 'react-native';
import { rad, sp, font } from '@shared/styles/uiTokens';

export const Button = styled.TouchableOpacity<{ variant?: 'primary' | 'danger' }>`
  background-color: ${({ theme, variant }) =>
    variant === 'danger' ? theme.colors.danger : theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  padding: ${({ theme }) => theme.spacing(1.75)}px;
  align-items: center;
  justify-content: center;
`;

export const ButtonsGrid = styled(View)`flex-direction:row;flex-wrap:wrap;justify-content:space-around;padding:${({theme})=>sp(theme,2)}px;`;
export const FeatureButton = styled(TouchableOpacity)`
  width:45%;height:45vw;max-height:180px;background-color:${({theme})=>theme?.colors?.card ?? '#f5f5f5'};
  border-radius:${({theme})=>rad(theme,'md',12)}px;justify-content:center;align-items:center;
  margin-bottom:${({theme})=>sp(theme,2)}px;border-width:1px;border-color:${({theme})=>theme?.colors?.border ?? '#ddd'};
`;
export const ButtonIcon = styled(Image)`width:60px;height:60px;margin-bottom:${({theme})=>sp(theme,1)}px;`;
export const ButtonText = styled(Text)`font-size:${({theme})=>font(theme,'small',14)}px;color:${({theme})=>theme?.colors?.text ?? '#111'};text-align:center;`;

//social

const Btn = styled.TouchableOpacity`
  margin-top: ${p => sp(p.theme, 2)}px;
  border-width: 1px;
  border-color: ${p => p.theme?.colors?.border ?? '#e5e7eb'};
  background-color: ${p => p.theme?.colors?.bg ?? '#fafafa'};
  padding: ${p => sp(p.theme, 1.5)}px;
  border-radius: ${p => rad(p.theme, 'lg', 12)}px;
  align-items: center; flex-direction: row; justify-content: center; gap: 8px;
`;
const Glyph = styled.View`
  width: 18px; height: 18px; border-radius: 9px;
  background-color: #fff; border-width: 1px; border-color: #e5e7eb;
`;

export function SocialButton({ children, leftGlyph = true, ...rest }:
  TouchableOpacityProps & { children: string; leftGlyph?: boolean }) {
  return (
    <Btn {...rest}>
      {leftGlyph && <Glyph />}
      <Text>{children}</Text>
    </Btn>
  );
}


