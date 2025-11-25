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
    lg: 'max-w-[750px]',
  };

  const modalContentClasses = clsx(
    'bg-card dark:bg-card-dark rounded-none sm:rounded-xl border-0 sm:border border-border dark:border-border-dark shadow-2xl w-full',
    'max-h-[85vh] sm:max-h-[85vh] h-full sm:h-auto flex flex-col',
    'mx-0 sm:mx-auto',
    sizeStyles[size]
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className={modalContentClasses} onClick={(e) => e.stopPropagation()}>
        {/* Header fijo */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 dark:border-border-dark">
          {title && <h3 className="text-lg font-semibold text-text dark:text-text-dark">{title}</h3>}
          <button
            onClick={onClose}
            className="text-2xl text-text-muted transition-colors hover:text-text dark:hover:text-text-dark"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer fijo */}
        {footer && (
          <div className="border-t border-border px-6 py-4 dark:border-border-dark">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
