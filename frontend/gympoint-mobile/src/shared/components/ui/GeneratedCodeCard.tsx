import React from 'react';
import { Feather } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';

import { Card } from './Card';
import { Button } from './Button';
import { ButtonText } from './Button';
import { palette } from '@shared/styles';

// Styled components específicos para GeneratedCodeCard
const GeneratedCodeWrapper = styled(View)`
  background-color: ${palette.neutralBg};
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
`;

const CodeHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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
  margin-bottom: 4px;
`;

const CodeFooterLabel = styled(Text)`
  font-size: 12px;
  color: ${palette.neutralText};
`;

const CodeFooterValue = styled(Text)<{ $color?: string }>`
  font-size: 12px;
  color: ${({ $color }) => $color ?? palette.neutralText};
`;

const IconButton = styled(TouchableOpacity)`
  padding: 4px;
`;

type GeneratedCode = {
  id: string;
  code: string;
  title: string;
  generatedAt: Date;
  expiresAt?: Date;
  used: boolean;
  usedAt?: Date;
};

type GeneratedCodeCardProps = {
  item: GeneratedCode;
  onCopy: (code: string) => void;
  onToggle: (code: GeneratedCode) => void;
  formatDate: (date: Date | undefined) => string;
};

export function GeneratedCodeCard({ 
  item, 
  onCopy, 
  onToggle, 
  formatDate 
}: GeneratedCodeCardProps) {
  const isExpired = item.expiresAt ? new Date() > item.expiresAt : false;
  const statusColor = item.used
    ? palette.neutralText
    : isExpired
    ? palette.danger
    : palette.lifestylePrimary;
  const statusText = item.used ? 'USADO' : isExpired ? 'VENCIDO' : 'DISPONIBLE';

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
        <CodeFooterLabel>Generado:</CodeFooterLabel>
        <CodeFooterValue>{formatDate(item.generatedAt)}</CodeFooterValue>
      </CodeFooterRow>
      
      <CodeFooterRow>
        <CodeFooterLabel>Vence:</CodeFooterLabel>
        <CodeFooterValue $color={isExpired ? palette.danger : undefined}>
          {formatDate(item.expiresAt)}
        </CodeFooterValue>
      </CodeFooterRow>
      
      {item.used && item.usedAt && (
        <CodeFooterRow>
          <CodeFooterLabel>Usado:</CodeFooterLabel>
          <CodeFooterValue>{formatDate(item.usedAt)}</CodeFooterValue>
        </CodeFooterRow>
      )}

      {!item.used && !isExpired && (
        <Button 
          variant="primary"
          onPress={() => onToggle(item)} 
          style={{ 
            marginTop: 8,
            minHeight: 44
          }}
        >
          <ButtonText style={{ 
            color: '#ffffff',
            fontWeight: '600'
          }}>
            Marcar como usado
          </ButtonText>
        </Button>
      )}
    </Card>
  );
}
