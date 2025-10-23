import React from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@shared/hooks';

import { Card } from './Card';
import { Button } from './Button';
import { palette } from '@shared/styles';
import { GeneratedCode } from '@features/rewards/domain/entities';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  const opacityClass = item.used ? 'opacity-60' : '';

  return (
    <Card className={opacityClass}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
          {item.title}
        </Text>
        {item.used && (
          <Feather name="check-circle" size={20} color={palette.lifestylePrimary} />
        )}
      </View>

      <View className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-surface-dark' : 'bg-surfaceVariant'}`}>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold font-mono" style={{ color: isDark ? '#fff' : '#000' }}>
            {item.code}
          </Text>
          <TouchableOpacity className="p-1" onPress={() => onCopy(item.code)}>
            <Feather name="copy" size={18} color={palette.neutralText} />
          </TouchableOpacity>
        </View>
        <Text
          className="text-xs font-bold uppercase"
          style={{ color: statusColor }}
        >
          {statusText}
        </Text>
      </View>

      <View className="flex-row justify-between mb-1">
        <Text className={`text-xs ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
          {DATE_LABELS.generated}
        </Text>
        <Text className={`text-xs ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
          {formatDate(item.generatedAt)}
        </Text>
      </View>

      <View className="flex-row justify-between mb-1">
        <Text className={`text-xs ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
          {DATE_LABELS.expires}
        </Text>
        <Text
          className="text-xs"
          style={{ color: isExpired ? palette.danger : isDark ? '#B0B8C8' : '#666666' }}
        >
          {formatDate(item.expiresAt)}
        </Text>
      </View>

      {item.used && item.usedAt && (
        <View className="flex-row justify-between mb-1">
          <Text className={`text-xs ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            {DATE_LABELS.used}
          </Text>
          <Text className={`text-xs ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            {formatDate(item.usedAt)}
          </Text>
        </View>
      )}

      {!item.used && !isExpired && (
        <Button
          variant="primary"
          onPress={() => onToggle(item)}
          className="mt-3 min-h-11"
        >
          {markAsUsedLabel}
        </Button>
      )}
    </Card>
  );
}
