import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  variant: 'premium' | 'free' | 'active' | 'inactive' | 'pending' | 'warning'  | 'danger';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => {
  const baseStyles = 'inline-block px-[0.85rem] py-[0.35rem] rounded-md text-sm font-semibold';

  const variantStyles = {
    premium: 'bg-primary/15 text-primary',
    free: 'bg-muted dark:bg-muted-dark text-text dark:text-text-dark',
    active: 'bg-success/15 text-success',
    inactive: 'bg-danger/15 text-danger',
    pending: 'bg-warning/15 text-warning',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-danger/15 text-danger',
  };

  const badgeClasses = clsx(
    baseStyles,
    variantStyles[variant],
    className
  );

  return <span className={badgeClasses}>{children}</span>;
};

export default Badge;
