import { useTheme } from "../../hooks";
import type { ParagraphProps } from "../../types";

export const Paragraph: React.FC<ParagraphProps> = ({
    children,
    size = 'md',
    color = 'default',
    align = 'left',
    ...props
}) => {
    const { theme } = useTheme();
    
    const sizeStyle = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };
    
    const colorStyle = {
        default: theme === 'light' ? 'text-primary-dark' : 'text-primary-light',
        muted: theme === 'light' ? 'text-muted-light' : 'text-muted-dark'
    };
    
    const alignStyle = {
        left: 'text-left',
        center: 'text-center', 
        right: 'text-right'
    };

    const className = `
        ${sizeStyle[size]}
        ${colorStyle[color]}
        ${alignStyle[align]}
    `;

    return (
    <p className={className.trim()} {...props}>
        {children}
    </p>
    );
};