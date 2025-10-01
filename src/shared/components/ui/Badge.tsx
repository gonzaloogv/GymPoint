import styled from 'styled-components/native';

export const Badge = styled.Text<{ variant?: 'secondary' | 'outline' }>`
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: ${p => p.theme?.colors?.text ?? '#111'};
  background-color: ${p =>
    p.variant === 'outline'
      ? 'transparent'
      : p.theme?.colors?.bg ?? '#f7f8fb'};
  border-width: ${p => (p.variant === 'outline' ? 1 : 0)}px;
  border-color: ${p => p.theme?.colors?.border ?? '#e5e7eb'};
`;
