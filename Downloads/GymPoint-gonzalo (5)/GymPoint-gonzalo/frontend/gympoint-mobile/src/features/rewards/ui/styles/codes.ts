import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import { palette } from '../../../../shared/styles';

export const GeneratedCodeCard = styled(View)<{ $dimmed?: boolean }>`
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.cardBg};
  gap: 12px;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.6 : 1)};
`;

export const GeneratedCodeWrapper = styled(View)`
  background-color: ${palette.neutralBg};
  padding: 12px;
  border-radius: 8px;
`;

export const CodeHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const CodeState = styled(Text)<{ $statusColor: string }>`
  font-size: 12px;
  font-weight: bold;
  color: ${({ $statusColor }) => $statusColor};
`;

export const CodeText = styled(Text)`
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
`;

export const CodeFooterRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 4px;
`;

export const CodeFooterLabel = styled(Text)`
  font-size: 12px;
  color: ${palette.neutralText};
`;

export const CodeFooterValue = styled(Text)<{ $color?: string }>`
  font-size: 12px;
  color: ${({ $color }) => $color ?? palette.neutralText};
`;
