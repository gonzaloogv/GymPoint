import { createContext, useState } from 'react';
import type { MapContextType, MapProviderProps } from '../types';

export const MapContext = createContext<MapContextType>({} as MapContextType);

export const MapProvider = ({ children }: MapProviderProps) => {
    const [isMapOpen, setIsMapOpen] = useState(false);

    const openMap = () => setIsMapOpen(true);
    const closeMap = () => setIsMapOpen(false);
    const toggleMap = () => setIsMapOpen(prev => !prev);

    return (
        <MapContext.Provider value={{ isMapOpen, openMap, closeMap, toggleMap }}>
            {children}
        </MapContext.Provider>
    );
};