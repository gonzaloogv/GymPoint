import styled from 'styled-components/native';

export const ProgressTrack = styled.View`
  height: ${({ theme }) => theme.spacing(1)}px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  overflow: hidden;
`;

export const ProgressFill = styled.View<{ value: number }>`
  width: ${(p) => Math.max(0, Math.min(100, p.value))}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const ProgressWrap = styled.View`
  padding: 0 ${({ theme }) => theme.spacing(2)}px;
  margin-bottom: ${({ theme }) => theme.spacing(2)}px;
`;
