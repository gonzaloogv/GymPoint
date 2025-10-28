import type React from "react";
import type { InputProps } from "../../types";
import { useTheme } from "../../hooks";

export const Input: React.FC<InputProps> = ({
    label,
    error,
    variant = 'default',
    helperText = 'Ingresa tu email principal',
    className = '',
    size = 'md',
    ...props
}) => {
    const currentVariant = error ? 'error' : variant;
    const { theme } = useTheme();
    
    const standard = 'rounded-md border-1 px-4 py-2 shadow-md transition-all duration-300 focus:outline-none';
    
    const variantStyle = {
        default: theme === 'light' 
            ? 'bg-primary-light text-primary-dark border-input-border focus:border-secondary'
            : 'bg-secondary-dark text-primary-light border-input-border focus:border-secondary',

        error: theme === 'light'
            ? 'bg-primary-light text-input-light border-error'
            : 'bg-secondary-dark text-primary-light border-error'
    };

    const sizeStyle = {
        sm: 'px-3 py-1.5 text-sm h-9',    
        md: 'px-4 py-2 text-base h-10',     
        lg: 'px-5 py-3 text-lg h-12',      
    };

    const computedClassName = `
        ${standard}
        ${variantStyle[currentVariant]}
        ${sizeStyle[size]}
        ${className}
    `;

    return (
        <div className="mb-4">
            {label && <label className={`block mb-2 text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>{label}</label>}
            <input className={computedClassName.trim()} {...props} />
            {error && <span className="block mt-1 text-error text-sm">{error}</span>}
            {helperText && !error && helperText.trim() !== '' && (
                <span className="block mt-1 text-gray-500 text-sm">{helperText}</span>
            )}
        </div>
    );
};