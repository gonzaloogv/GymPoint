import React from 'react';
import type { ContainerProps } from '../../types';

export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className || ''}`}>
      {children}
    </div>
  );
};