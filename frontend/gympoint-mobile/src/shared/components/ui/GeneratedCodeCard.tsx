import React from 'react';
import { Feather } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'styled-components/native';

import { Card } from './Card';
import { Button } from './Button';
import { ButtonText } from './Button';
import { palette } from '@shared/styles';
import { GeneratedCode } from '@features/rewards/domain/entities';

// Styled components específicos para GeneratedCodeCard
const GeneratedCodeWrapper = styled(View)`
  background-color: ${({ theme }) => theme.colors.muted || '#f3f4f6'};
  padding: ${({ theme }) => theme.spacing(1.5)}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  margin: ${({ theme }) => theme.spacing(1)}px 0;
`;

const CodeHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(1)}px;
`;

const CodeState = styled(Text)<{ $statusColor: string }>`
  font-size: 12px;
  font-weight: bold;
  color: ${({ $statusColor }) => $statusColor};
  text-transform: uppercase;
`;

const CodeText = styled(Text)`
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const CodeFooterRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(0.5)}px;
`;

const CodeFooterLabel = styled(Text)`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const CodeFooterValue = styled(Text)<{ $color?: string }>`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ theme, $color }) => $color ?? theme.colors.subtext};
`;

const IconButton = styled(TouchableOpacity)`
  padding: ${({ theme }) => theme.spacing(0.5)}px;
`;

const STATUS_LABELS = {
  used: 'USADO',
  expired: 'VENCIDO',
  available: 'DISPONIBLE',
} as const;

const DATE_LABELS = {
  generated: 'Generado:',
  expires: 'Vence:',
  used: 'Usado:',
} as const;

type GeneratedCodeCardProps = {
  item: GeneratedCode;
  onCopy: (code: string) => void;
  onToggle: (code: GeneratedCode) => void;
  formatDate: (date: Date | undefined) => string;
  markAsUsedLabel?: string;
};

export function GeneratedCodeCard({ 
  item, 
  onCopy, 
  onToggle, 
  formatDate,
  markAsUsedLabel = 'Marcar como usado',
}: GeneratedCodeCardProps) {
  const theme = useTheme();
  const isExpired = item.expiresAt ? new Date() > item.expiresAt : false;
  const statusColor = item.used
    ? palette.neutralText
    : isExpired
    ? palette.danger
    : palette.lifestylePrimary;
  const statusText = item.used 
    ? STATUS_LABELS.used 
    : isExpired 
    ? STATUS_LABELS.expired 
    : STATUS_LABELS.available;

  return (
    <Card style={{ opacity: item.used ? 0.6 : 1 }}>
      <CodeHeader>
        <CodeFooterLabel>{item.title}</CodeFooterLabel>
        {item.used && <Feather name="check-circle" size={20} color={palette.lifestylePrimary} />}
      </CodeHeader>

      <GeneratedCodeWrapper>
        <CodeHeader>
          <CodeText>{item.code}</CodeText>
          <IconButton onPress={() => onCopy(item.code)}>
            <Feather name="copy" size={18} color={palette.neutralText} />
          </IconButton>
        </CodeHeader>
        <CodeState $statusColor={statusColor}>{statusText}</CodeState>
      </GeneratedCodeWrapper>

      <CodeFooterRow>
        <CodeFooterLabel>{DATE_LABELS.generated}</CodeFooterLabel>
        <CodeFooterValue>{formatDate(item.generatedAt)}</CodeFooterValue>
      </CodeFooterRow>
      
      <CodeFooterRow>
        <CodeFooterLabel>{DATE_LABELS.expires}</CodeFooterLabel>
        <CodeFooterValue $color={isExpired ? palette.danger : undefined}>
          {formatDate(item.expiresAt)}
        </CodeFooterValue>
      </CodeFooterRow>
      
      {item.used && item.usedAt && (
        <CodeFooterRow>
          <CodeFooterLabel>{DATE_LABELS.used}</CodeFooterLabel>
          <CodeFooterValue>{formatDate(item.usedAt)}</CodeFooterValue>
        </CodeFooterRow>
      )}

      {!item.used && !isExpired && (
        <Button 
          variant="primary"
          onPress={() => onToggle(item)} 
          style={{ 
            marginTop: theme.spacing(1),
            minHeight: 44
          }}
        >
          <ButtonText>
            {markAsUsedLabel}
          </ButtonText>
        </Button>
      )}
    </Card>
  );
}
