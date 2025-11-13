import React from 'react';
import clsx from 'clsx';

type CardElement = 'div' | 'section' | 'article' | 'aside';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  as?: CardElement;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className,
  as: Component = 'div',
  ...ariaProps
}) => {
  const cardClasses = clsx(
    'bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark shadow-md p-6',
    className
  );

  return (
    <Component className={cardClasses} {...ariaProps}>
      {(title || subtitle) && (
        <header className="mb-4">
          {title && <h3 className="text-lg font-semibold text-text dark:text-text-dark">{title}</h3>}
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </header>
      )}
      <div>{children}</div>
      {footer && <footer className="mt-4 pt-4 border-t border-border dark:border-border-dark">{footer}</footer>}
    </Component>
  );
};

export default Card;