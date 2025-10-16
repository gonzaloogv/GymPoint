import { Feather } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';

import { Card } from './Card';
import { Button } from './Button';
import { ButtonText } from './Button';
import { GeneratedCode } from '@features/rewards/domain/entities';

// Styled components específicos para GeneratedCodeCard
const CodeCardContent = styled(View)`
  gap: 12px;
`;

const CodeHeader = styled(View)`
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
`;

const StatusIcon = styled(View)<{ $status: 'used' | 'expired' | 'available' }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $status }) =>
    $status === 'used' ? '#d1fae5' :
    $status === 'expired' ? '#fee2e2' : '#e5e7eb'};
  margin-top: 2px;
`;

const CodeHeaderTexts = styled(View)`
  flex: 1;
  gap: 4px;
`;

const CodeDiscount = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 22px;
`;

const CodeTitle = styled(Text)`
  font-size: 14px;
  color: #6b7280;
  line-height: 20px;
`;

const StatusBadge = styled(View)<{ $status: 'used' | 'expired' | 'available' }>`
  background-color: ${({ $status }) =>
    $status === 'used' ? '#d1fae5' :
    $status === 'expired' ? '#fee2e2' : '#dbeafe'};
  padding: 4px 10px;
  border-radius: 12px;
  align-self: flex-start;
`;

const StatusText = styled(Text)<{ $status: 'used' | 'expired' | 'available' }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $status }) =>
    $status === 'used' ? '#059669' :
    $status === 'expired' ? '#dc2626' : '#2563eb'};
`;

const CodeBoxWrapper = styled(View)`
  background-color: #e5e7eb;
  padding: 14px 16px;
  border-radius: 8px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CodeText = styled(Text)`
  font-family: monospace;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 0.5px;
`;

const IconButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const DateRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const DateLabel = styled(Text)`
  font-size: 12px;
  color: #6b7280;
`;

const DateValue = styled(Text)<{ $isExpired?: boolean; $isUsed?: boolean }>`
  font-size: 12px;
  color: ${({ $isExpired, $isUsed }) =>
    $isUsed ? '#059669' :
    $isExpired ? '#dc2626' : '#6b7280'};
  font-weight: 500;
`;

const ButtonsRow = styled(View)`
  flex-direction: row;
  gap: 8px;
  margin-top: 4px;
`;

const STATUS_LABELS = {
  used: 'Usado',
  expired: 'Vencido',
  available: 'Disponible',
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
  onViewQR?: (code: GeneratedCode) => void;
  showActions?: boolean;
};

export function GeneratedCodeCard({
  item,
  onCopy,
  onToggle,
  formatDate,
  onViewQR,
  showActions = false,
}: GeneratedCodeCardProps) {
  const isExpired = item.expiresAt ? new Date() > item.expiresAt : false;
  const status = item.used ? 'used' : isExpired ? 'expired' : 'available';
  const statusText = STATUS_LABELS[status];

  // Extraer descuento del título
  const discountMatch = item.title.match(/(\d+%)/);
  const discount = discountMatch ? discountMatch[1] + ' descuento' : item.title;

  return (
    <Card
      style={{
        opacity: item.used || isExpired ? 0.8 : 1,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
      }}
    >
      <CodeCardContent>
        {/* Header con icono de check/reloj y textos */}
        <CodeHeader>
          <StatusIcon $status={status}>
            {item.used ? (
              <Feather name="check" size={14} color="#059669" />
            ) : isExpired ? (
              <Feather name="clock" size={14} color="#dc2626" />
            ) : (
              <Feather name="clock" size={14} color="#6b7280" />
            )}
          </StatusIcon>
          <CodeHeaderTexts>
            <CodeDiscount>{discount}</CodeDiscount>
            <CodeTitle>
              {item.title.replace(/\d+%\s*descuento\s*/i, '').trim()}
            </CodeTitle>
          </CodeHeaderTexts>
          <StatusBadge $status={status}>
            <StatusText $status={status}>{statusText}</StatusText>
          </StatusBadge>
        </CodeHeader>

        {/* Código con botón de copiar */}
        <CodeBoxWrapper>
          <CodeText>{item.code}</CodeText>
          <IconButton onPress={() => onCopy(item.code)}>
            <Feather name="copy" size={18} color="#6b7280" />
          </IconButton>
        </CodeBoxWrapper>

        {/* Fechas */}
        <DateRow>
          <DateLabel>{DATE_LABELS.generated}</DateLabel>
          <DateValue>{formatDate(item.generatedAt)}</DateValue>
        </DateRow>

        <DateRow>
          <DateLabel>{DATE_LABELS.expires}</DateLabel>
          <DateValue $isExpired={isExpired}>{formatDate(item.expiresAt)}</DateValue>
        </DateRow>

        {item.used && item.usedAt && (
          <DateRow>
            <DateLabel>{DATE_LABELS.used}</DateLabel>
            <DateValue $isUsed={true}>{formatDate(item.usedAt)}</DateValue>
          </DateRow>
        )}

        {/* Botones de acción para códigos disponibles (pestaña "Disponibles") */}
        {showActions && !item.used && !isExpired && (
          <ButtonsRow>
            <Button
              variant="primary"
              onPress={() => {
                // Acción de canjear (podría abrir un navegador, etc.)
                console.log('Canjear código:', item.code);
              }}
              style={{
                flex: 1,
                backgroundColor: '#3b82f6',
                minHeight: 44,
              }}
            >
              <ButtonText style={{ color: '#ffffff', fontWeight: '600' }}>
                Canjear
              </ButtonText>
            </Button>
            <Button
              onPress={() => onToggle(item)}
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                minHeight: 44,
              }}
            >
              <ButtonText style={{ color: '#6b7280', fontWeight: '600' }}>
                Marcar usado
              </ButtonText>
            </Button>
          </ButtonsRow>
        )}

        {/* Botón Ver QR solo para códigos usados (pestaña "Mis códigos") */}
        {!showActions && item.used && onViewQR && (
          <Button
            variant="primary"
            onPress={() => onViewQR(item)}
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Feather name="maximize" size={16} color="#6b7280" />
            <ButtonText style={{ color: '#1f2937', fontWeight: '500' }}>
              Ver QR
            </ButtonText>
          </Button>
        )}
      </CodeCardContent>
    </Card>
  );
}
