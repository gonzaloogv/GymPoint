import React from 'react';
import styled from 'styled-components/native';

const PillContainer = styled.View<{ $focused: boolean; $primaryColor: string }>`
  width: 100%;
  align-items: center;
  padding-vertical: 4px;
  padding-horizontal: 12px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ $focused, $primaryColor }) =>
    $focused ? `${$primaryColor}1A` : 'transparent'};
`;

const PillText = styled.Text<{
  $focused: boolean;
  $primaryColor: string;
  $textMuted: string;
}>`
  font-size: 12px;
  line-height: 14px;
  margin-top: 4px;
  color: ${({ $focused, $primaryColor, $textMuted }) =>
    $focused ? $primaryColor : $textMuted};
`;

type Props = {
  focused: boolean;
  children: React.ReactNode;
  label: string;
  primaryColor: string;
  textMuted: string;
};

export function TabPill({ focused, children, label, primaryColor, textMuted }: Props) {
  return (
    <PillContainer $focused={focused} $primaryColor={primaryColor}>
      {children}
      <PillText
        $focused={focused}
        $primaryColor={primaryColor}
        $textMuted={textMuted}
        allowFontScaling={false}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
        {label}
      </PillText>
    </PillContainer>
  );
}
