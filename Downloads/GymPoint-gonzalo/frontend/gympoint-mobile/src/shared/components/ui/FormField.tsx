import styled from 'styled-components/native';
import { ReactNode } from 'react';
import { font, sp } from '@shared/styles';

export const Field = styled.View`
  width: 100%;
  margin-bottom: ${(p) => sp(p.theme, 2)}px;
`;

export const Label = styled.Text`
  color: ${(p) => p.theme?.colors?.subtext ?? '#374151'};
  margin-bottom: 6px;
  font-size: ${(p) => font(p.theme, 'small', 13)}px;
`;

export function FormField({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <Field>
      {label ? <Label>{label}</Label> : null}
      {children}
    </Field>
  );
}
