import React from 'react';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) {
    return null;
  }

  const sizeStyles = {
    sm: 'max-w-[400px]',
    md: 'max-w-[600px]',
    lg: 'max-w-[800px]',
  };

  const modalContentClasses = clsx(
    'bg-card dark:bg-card-dark p-8 rounded-xl border border-border dark:border-border-dark shadow-lg w-full',
    sizeStyles[size]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className={modalContentClasses} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-lg font-semibold text-text dark:text-text-dark">{title}</h3>}
          <button onClick={onClose} className="text-text-muted hover:text-text dark:hover:text-text-dark text-2xl">&times;</button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-4 pt-4 border-t border-border dark:border-border-dark">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
