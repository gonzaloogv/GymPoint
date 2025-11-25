import React, { TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  rows = 4,
  disabled = false,
  className,
  ...props
}) => {
  const textareaClasses = clsx(
    'px-4 py-[0.85rem] border border-input-border dark:border-input-border-dark rounded-lg bg-input-bg dark:bg-input-bg-dark text-text dark:text-text-dark focus:outline-none focus:border-primary w-full resize-vertical',
    {
      'border-danger/50': error,
    },
    className
  );

  return (
    <div className="w-full">
      {label && <label className="text-text dark:text-text-dark font-medium text-sm mb-1 block">{label}</label>}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className={textareaClasses}
        {...props}
      />
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Textarea;
