import React, { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  label,
  options = [],
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className,
  children,
  ...props
}) => {
  const selectClasses = clsx(
    'px-4 py-[0.85rem] border border-input-border dark:border-input-border-dark rounded-lg bg-input-bg dark:bg-input-bg-dark text-text dark:text-text-dark focus:outline-none focus:border-primary w-full',
    {
      'border-danger/50': error,
    },
    className
  );

  return (
    <div className="w-full">
      {label && <label className="text-text dark:text-text-dark font-medium text-sm mb-1 block">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.length > 0
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Select;
