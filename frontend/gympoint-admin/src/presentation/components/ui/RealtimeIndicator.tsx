import { useWebSocketStatus } from '../../hooks/useRealtimeSync';

interface RealtimeIndicatorProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Componente que muestra el estado de conexión WebSocket en tiempo real
 * Usa Tailwind CSS para estilos y animaciones
 */
export function RealtimeIndicator({
  showLabel = true,
  size = 'md',
  className = '',
}: RealtimeIndicatorProps) {
  const isConnected = useWebSocketStatus();

  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const dotSize = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Dot indicator con animación */}
      <div className="relative flex items-center justify-center">
        {/* Pulso de fondo cuando está conectado */}
        {isConnected && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
        )}

        {/* Dot principal */}
        <span
          className={`relative inline-flex rounded-full transition-colors duration-300 ${dotSize} ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {isConnected ? 'En vivo' : 'Desconectado'}
        </span>
      )}
    </div>
  );
}

/**
 * Variante tooltip para mostrar en esquina
 */
export function RealtimeIndicatorTooltip() {
  const isConnected = useWebSocketStatus();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 shadow-lg backdrop-blur-sm transition-all duration-300 ${
          isConnected
            ? 'bg-green-50/90 border border-green-200'
            : 'bg-gray-50/90 border border-gray-200'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {isConnected && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full transition-colors duration-300 ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>
        <span
          className={`text-xs font-medium transition-colors duration-300 ${
            isConnected ? 'text-green-700' : 'text-gray-600'
          }`}
        >
          {isConnected ? 'Actualizaciones en vivo' : 'Sin conexión en vivo'}
        </span>
      </div>
    </div>
  );
}
