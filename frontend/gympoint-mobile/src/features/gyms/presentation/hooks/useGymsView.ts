import { useState } from 'react';

export function useGymsView(initialView: 'map' | 'list' = 'map') {
  const [viewMode, setViewMode] = useState<'map' | 'list'>(initialView);

  const switchToMap = () => setViewMode('map');
  const switchToList = () => setViewMode('list');
  const toggleView = () => setViewMode(current => current === 'map' ? 'list' : 'map');

  const isListView = viewMode === 'list';
  const isMapView = viewMode === 'map';

  return {
    viewMode,
    setViewMode,
    switchToMap,
    switchToList,
    toggleView,
    isListView,
    isMapView,
  };
}
