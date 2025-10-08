import { useState } from 'react';

export function useGymsFilters() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState('');
  const [openNow, setOpenNow] = useState(false);
  const [timeFilter, setTimeFilter] = useState('');

  const openFilters = () => setFilterVisible(true);
  const closeFilters = () => setFilterVisible(false);

  const clearFilters = () => {
    setSelectedServices([]);
    setPriceFilter('');
    setOpenNow(false);
    setTimeFilter('');
  };

  return {
    // State
    filterVisible,
    selectedServices,
    priceFilter,
    openNow,
    timeFilter,

    // Actions
    setFilterVisible,
    setSelectedServices,
    setPriceFilter,
    setOpenNow,
    setTimeFilter,
    openFilters,
    closeFilters,
    clearFilters,
  };
}
