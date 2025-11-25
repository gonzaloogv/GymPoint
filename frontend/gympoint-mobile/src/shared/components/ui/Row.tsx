import React from 'react';
import { View } from 'react-native';

interface RowProps {
  children: React.ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: number;
  className?: string;
}

export const Row: React.FC<RowProps> = ({
  children,
  justify = 'start',
  align = 'center',
  gap = 0,
  className = '',
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const gapClass = gap > 0 ? `gap-${gap}` : '';

  const rowClasses = `
    flex-row
    ${justifyClasses[justify]}
    ${alignClasses[align]}
    ${gapClass}
    ${className}
  `.trim();

  return <View className={rowClasses}>{children}</View>
};