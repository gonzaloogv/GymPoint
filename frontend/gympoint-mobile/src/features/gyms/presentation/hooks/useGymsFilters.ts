import { useState } from 'react';

export function useGymsFilters() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [openNow, setOpenNow] = useState(false);
  const [timeFilter, setTimeFilter] = useState('');

  const openFilters = () => setFilterVisible(true);
  const closeFilters = () => setFilterVisible(false);

  const clearFilters = () => {
    setSelectedServices([]);
    setSelectedAmenities([]);
    setSelectedFeatures([]);
    setPriceFilter('');
    setRatingFilter('');
    setOpenNow(false);
    setTimeFilter('');
  };

  return {
    // State
    filterVisible,
    selectedServices,
    selectedAmenities,
    selectedFeatures,
    priceFilter,
    ratingFilter,
    openNow,
    timeFilter,

    // Actions
    setFilterVisible,
    setSelectedServices,
    setSelectedAmenities,
    setSelectedFeatures,
    setPriceFilter,
    setRatingFilter,
    setOpenNow,
    setTimeFilter,
    openFilters,
    closeFilters,
    clearFilters,
  };
}
