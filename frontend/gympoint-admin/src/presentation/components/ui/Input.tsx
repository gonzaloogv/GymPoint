import React, { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'url' | 'tel' | 'time';
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  label,
  error,
  disabled = false,
  value,
  onChange,
  className,
  ...props
}) => {
  const inputClasses = clsx(
    'px-4 py-[0.85rem] border border-input-border dark:border-input-border-dark rounded-lg bg-input-bg dark:bg-input-bg-dark text-text dark:text-text-dark focus:outline-none focus:border-primary w-full',
    {
      'border-danger/50': error,
    },
    className
  );

  return (
    <div className="w-full">
      {label && <label className="text-text dark:text-text-dark font-medium text-sm mb-1 block">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={inputClasses}
        {...props}
      />
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
