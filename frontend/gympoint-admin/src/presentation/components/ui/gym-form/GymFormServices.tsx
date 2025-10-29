import { useState } from 'react';
import { Input, Button } from '../index';

interface GymFormServicesProps {
  services: string[];
  onAddService: (service: string) => void;
  onRemoveService: (index: number) => void;
}

export const GymFormServices = ({ services, onAddService, onRemoveService }: GymFormServicesProps) => {
  const [draftService, setDraftService] = useState('');

  const handleAddService = () => {
    const trimmed = draftService.trim();
    if (!trimmed) return;
    onAddService(trimmed);
    setDraftService('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddService();
    }
  };

  // Servicios sugeridos comunes
  const suggestedServices = [
    'Funcional',
    'CrossFit',
    'Musculación',
    'Cardio',
    'Yoga',
    'Pilates',
    'Spinning',
    'Boxing',
    'Zumba',
    'Natación',
  ];

  const handleSuggestedClick = (service: string) => {
    if (!services.includes(service)) {
      onAddService(service);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text dark:text-text-dark">Servicios y tipos de entrenamiento</h3>
          <p className="text-xs text-text-muted mt-1">Especifica qué tipos de entrenamiento ofrece tu gimnasio</p>
        </div>
        <span className="text-xs text-text-muted bg-bg dark:bg-bg-dark px-3 py-1 rounded-full">
          {services.length} {services.length === 1 ? 'servicio' : 'servicios'}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          label="Nuevo servicio"
          value={draftService}
          onChange={(event) => setDraftService(event.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ej: Funcional, CrossFit, Musculación..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="primary"
          onClick={handleAddService}
          className="self-end transition-transform duration-200 hover:scale-105"
        >
          Agregar
        </Button>
      </div>

      {/* Servicios sugeridos */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-text-muted">Sugerencias:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedServices
            .filter(s => !services.includes(s))
            .map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => handleSuggestedClick(service)}
                className="px-3 py-1 text-xs rounded-full border border-border dark:border-border-dark text-text-muted hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 hover:scale-105"
              >
                + {service}
              </button>
            ))}
        </div>
      </div>

      {/* Lista de servicios agregados */}
      {services.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text dark:text-text-dark">Servicios agregados:</p>
          <ul className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <li
                key={`${service}-${index}`}
                className="group flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/30 px-4 py-2 text-sm text-primary dark:text-primary-light transition-all duration-200 hover:shadow-md hover:scale-105"
              >
                <span className="font-medium">✓ {service}</span>
                <button
                  type="button"
                  onClick={() => onRemoveService(index)}
                  className="text-xs text-danger opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:underline ml-1"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {services.length === 0 && (
        <div className="text-center py-8 text-text-muted text-sm border-2 border-dashed border-border dark:border-border-dark rounded-lg">
          <span className="text-2xl mb-2 block">🏋️</span>
          No hay servicios agregados. Agrega al menos un tipo de entrenamiento.
        </div>
      )}
    </div>
  );
};
