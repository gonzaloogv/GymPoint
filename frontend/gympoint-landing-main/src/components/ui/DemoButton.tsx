import { useMap } from '../../hooks';
import { Button } from './Button';

interface DemoButtonProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onAdditionalClick?: () => void;
}

export const DemoButton: React.FC<DemoButtonProps> = ({ 
    size = 'lg', 
    className = '',
    onAdditionalClick 
}) => {
    const { isMapOpen, toggleMap } = useMap();

    const handleClick = () => {
        const wasOpen = isMapOpen;
        
        toggleMap();
        
        if (!wasOpen) {
            setTimeout(() => {
                const mapElement = document.getElementById('map');
                if (mapElement) {
                    const elementPosition = mapElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - 100; 
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
        
        onAdditionalClick?.();
    };

    return (
        <Button 
            variant={isMapOpen ? 'danger' : 'primary'}
            size={size}
            onClick={handleClick}
            className={className}
        >
            {isMapOpen ? 'Cerrar Mapa' : 'Probar Demo'}
        </Button>
    );
};