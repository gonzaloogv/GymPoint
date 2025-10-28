import type { ReactNode } from "react";

export interface MapContextType {
    isMapOpen: boolean;
    openMap: () => void;
    closeMap: () => void;
    toggleMap: () => void;
}

export interface MapProviderProps {
    children: ReactNode;
}