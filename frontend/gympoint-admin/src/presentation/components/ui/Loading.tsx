import React from 'react';
import clsx from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', fullPage = false }) => {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinnerClasses = clsx(
    'border-4 border-border dark:border-border-dark border-t-primary rounded-full animate-spin',
    sizeStyles[size]
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark">
        <div className={spinnerClasses} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className={spinnerClasses} />
    </div>
  );
};

export default Loading;