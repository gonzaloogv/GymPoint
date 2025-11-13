import { useState } from 'react';

/**
 * Hook para manejar los tres estados de vista del MapScreen:
 * - 'default': Vista principal con mapa card pequeño + lista
 * - 'list': Solo lista sin mapa
 * - 'fullscreen': Mapa completo en modal (sin lista)
 */
export function useGymsView(initialView: 'default' | 'list' | 'fullscreen' = 'default') {
  const [viewMode, setViewMode] = useState<'default' | 'list' | 'fullscreen'>(initialView);

  const switchToDefault = () => setViewMode('default');
  const switchToList = () => setViewMode('list');
  const openFullscreenMap = () => setViewMode('fullscreen');
  const closeFullscreenMap = () => setViewMode('default');

  const isDefaultView = viewMode === 'default';
  const isListView = viewMode === 'list';
  const isFullscreenView = viewMode === 'fullscreen';

  return {
    viewMode,
    setViewMode,
    switchToDefault,
    switchToList,
    openFullscreenMap,
    closeFullscreenMap,
    isDefaultView,
    isListView,
    isFullscreenView,
  };
}
