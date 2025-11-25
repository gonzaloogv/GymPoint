import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium transition-opacity duration-300 rounded-lg';

  const variantStyles = {
    primary: 'bg-primary text-primary-text',
    secondary: 'bg-muted dark:bg-muted-dark text-text dark:text-text-dark',
    success: 'bg-success text-primary-text',
    danger: 'bg-danger text-primary-text',
  };

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const stateStyles =
    'hover:opacity-85 disabled:opacity-60 disabled:cursor-not-allowed';

  const buttonClasses = clsx(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    stateStyles,
    className
  );

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
