import type React from "react";
import { useTheme } from "../../hooks";
import type { TextareaProps } from "../../types";

    export const TextArea: React.FC<TextareaProps> = ({
        label,
        error,
        variant = 'default',
        helperText = 'Escribe tu mensaje aqui...',
        className = '',
        size = 'md',
        ...props
    }) => {
        const currentVariant = error ? 'error' : variant;
        const { theme } = useTheme();
        
        const standard = 'w-full rounded-md border-1 px-4 py-2 shadow-md transition-all duration-300 focus:outline-none resize-y';
        
        const variantStyle = {
            default: theme === 'light' 
                ? 'bg-primary-light text-primary-dark border-input-border focus:border-secondary'
                : 'bg-secondary-dark text-primary-light border-input-border focus:border-secondary',

            error: theme === 'light'
                ? 'bg-primary-light text-input-light border-error'
                : 'bg-secondary-dark text-primary-light border-error'
        };

        const sizeStyle = {
            sm: 'px-3 py-1.5 text-sm min-h-16',    
            md: 'px-4 py-2 text-base min-h-24',     
            lg: 'px-5 py-3 text-lg min-h-32',      
        };

        const computedClassName = `
            ${standard}
            ${variantStyle[currentVariant]}
            ${sizeStyle[size]}
            ${className}
        `;

        return (
            <div className="w-full">
                {label && (
                <label className={`block mb-2 text-sm font-medium ${
                    theme === 'light' ? 'text-gray-900' : 'text-gray-200'
                }`}>
                    {label}
                </label>
                )}
                <textarea
                    className={computedClassName.trim()} 
                    rows={size === 'sm' ? 3 : size === 'lg' ? 6 : 4}
                    {...props} 
                />
                {error && (
                <span className="block mt-1 text-input-text-error text-sm">{error}</span>
                )}
                {helperText && !error && helperText.trim() !== '' && (
                <span className={`block mt-1 text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                    {helperText}
                </span>
                )}
            </div>
        );
    };