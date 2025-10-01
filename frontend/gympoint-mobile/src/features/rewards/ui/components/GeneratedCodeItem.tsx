import React from 'react';
import { Feather } from '@expo/vector-icons';

import { palette } from '../../../../shared/styles';
import { GeneratedCode } from '../../types';
import { formatDate } from '../../utils/categories';
import {
  GeneratedCodeCard,
  GeneratedCodeWrapper,
  CodeHeader,
  CodeState,
  CodeText,
  CodeFooterRow,
  CodeFooterLabel,
  CodeFooterValue,
  ActionButton,
  ActionButtonText,
  IconButton,
} from '../styles';

type GeneratedCodeItemProps = {
  item: GeneratedCode;
  onCopy: (code: string) => void;
  onToggle: (code: GeneratedCode) => void;
};

export const GeneratedCodeItem: React.FC<GeneratedCodeItemProps> = ({
  item,
  onCopy,
  onToggle,
}) => {
  const isExpired = item.expiresAt ? new Date() > item.expiresAt : false;
  const statusColor = item.used
    ? palette.neutralText
    : isExpired
    ? palette.danger
    : palette.lifestylePrimary;
  const statusText = item.used ? 'USADO' : isExpired ? 'VENCIDO' : 'DISPONIBLE';

  return (
    <GeneratedCodeCard $dimmed={item.used}>
      <CodeHeader>
        <CodeFooterLabel>{item.title}</CodeFooterLabel>
        {item.used ? <Feather name="check-circle" size={20} color={palette.lifestylePrimary} /> : null}
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
      {item.used && item.usedAt ? (
        <CodeFooterRow>
          <CodeFooterLabel>Usado:</CodeFooterLabel>
          <CodeFooterValue>{formatDate(item.usedAt)}</CodeFooterValue>
        </CodeFooterRow>
      ) : null}

      {!item.used && !isExpired ? (
        <ActionButton onPress={() => onToggle(item)}>
          <ActionButtonText>Marcar como usado</ActionButtonText>
        </ActionButton>
      ) : null}
    </GeneratedCodeCard>
  );
};
