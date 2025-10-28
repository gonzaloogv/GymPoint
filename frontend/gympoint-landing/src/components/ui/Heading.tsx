import type React from "react";
import { useTheme } from "../../hooks";
import type { HeadingProps } from "../../types";

export const Heading: React.FC<HeadingProps> = ({
    children,
    variant = 'h1',
    color = 'default',
    align = 'center',
    className = '',
    ...props
}) => {
    const { theme } = useTheme();
    
    const variantH = {
        h1:'text-5xl font-bold',
        h2:'text-4xl font-bold',
        h3:'text-3xl font-semibold',
        h4:'text-2xl font-semibold'
    };

    const colorStyle = {
        default: theme === 'light'
        ? 'text-gray-900'
        : 'text-gray-200',

        accent: 'text-secondary'
    };

    const alignStyle = {
        left: 'text-left',
        center: 'text-center', 
        right: 'text-right'
    };

    const Tag = variant;

    const computedClassName = `
        ${variantH[variant]}
        ${colorStyle[color]}
        ${alignStyle[align]}
        ${className}
    `;

    return (
        <Tag className={computedClassName.trim()} {...props}>
            {children}
        </Tag>
    );
};