import { useContext } from "react";
import { MapContext } from "../context/MapContext";

export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap debe ser usado dentro de MapProvider');
    }
    return context;
};