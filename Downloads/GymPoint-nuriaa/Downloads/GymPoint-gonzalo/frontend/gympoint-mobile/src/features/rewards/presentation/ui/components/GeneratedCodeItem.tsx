import React from 'react';
import { GeneratedCodeCard } from '@shared/components/ui';
import { GeneratedCode } from '@features/rewards/domain/entities';
import { formatDate } from '../../utils/categories';

type GeneratedCodeItemProps = {
  item: GeneratedCode;
  onCopy: (code: string) => void;
  onToggle: (code: GeneratedCode) => void;
  showActions?: boolean;
};

export const GeneratedCodeItem: React.FC<GeneratedCodeItemProps> = ({
  item,
  onCopy,
  onToggle,
  showActions = false,
}) => {
  return (
    <GeneratedCodeCard
      item={item}
      onCopy={onCopy}
      onToggle={onToggle}
      formatDate={formatDate}
      showActions={showActions}
    />
  );
};
