import React from 'react';
import {
  SERVICE_OPTIONS,
  TIME_OPTIONS,
  AMENITY_OPTIONS,
  SPECIAL_FEATURES,
} from '@features/gyms/domain/constants/filters';
import {
  FilterSheet,
  ChipSelector,
  StarRatingSelector,
  PriceRangeSelector,
  FilterSection,
} from '@shared/components/ui';

type FiltersSheetProps = {
  visible: boolean;
  onClose: () => void;
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (amenities: string[]) => void;
  selectedFeatures: string[];
  setSelectedFeatures: (features: string[]) => void;
  priceFilter: string;
  setPriceFilter: (price: string) => void;
  ratingFilter: string;
  setRatingFilter: (rating: string) => void;
  openNow: boolean;
  setOpenNow: (value: boolean) => void;
  timeFilter: string;
  setTimeFilter: (time: string) => void;
  onClear?: () => void;
  onApply?: () => void;
};

const FiltersSheet: React.FC<FiltersSheetProps> = ({
  visible,
  onClose,
  selectedServices,
  setSelectedServices,
  selectedAmenities,
  setSelectedAmenities,
  selectedFeatures,
  setSelectedFeatures,
  priceFilter,
  setPriceFilter,
  ratingFilter,
  setRatingFilter,
  openNow,
  setOpenNow,
  timeFilter,
  setTimeFilter,
  onClear,
  onApply,
}) => {
  const toggleService = (service: string) => {
    const nextServices = selectedServices.includes(service)
      ? selectedServices.filter((item) => item !== service)
      : [...selectedServices, service];
    setSelectedServices(nextServices);
  };

  const toggleAmenity = (amenity: string) => {
    const nextAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((item) => item !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(nextAmenities);
  };

  const toggleFeature = (feature: string) => {
    const nextFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((item) => item !== feature)
      : [...selectedFeatures, feature];
    setSelectedFeatures(nextFeatures);
  };

  const togglePrice = (price: string) => {
    setPriceFilter(priceFilter === price ? '' : price);
  };

  const toggleRating = (rating: string) => {
    setRatingFilter(ratingFilter === rating ? '' : rating);
  };

  const toggleTime = (time: string) => {
    setTimeFilter(timeFilter === time ? '' : time);
  };

  const handleClear = () => {
    setSelectedServices([]);
    setSelectedAmenities([]);
    setSelectedFeatures([]);
    setPriceFilter('');
    setRatingFilter('');
    setOpenNow(false);
    setTimeFilter('');
    onClear?.();
  };

  const handleApply = () => {
    onApply?.();
    onClose();
  };

  return (
    <FilterSheet
      visible={visible}
      onClose={onClose}
      title="Filtros"
      onClear={handleClear}
      onApply={handleApply}
    >
      {/* Precio con diseño mejorado */}
      <PriceRangeSelector
        title="Precio mensual"
        selectedPrice={priceFilter}
        onSelectPrice={togglePrice}
      />

      {/* Calificación con estrellas */}
      <StarRatingSelector
        title="Calificación"
        selectedRating={ratingFilter}
        onSelectRating={toggleRating}
        spaced
      />

      {/* Servicios con ícono */}
      <FilterSection title="Servicios" icon="barbell-outline" spaced>
        <ChipSelector
          options={SERVICE_OPTIONS}
          isActive={(value) => selectedServices.includes(value)}
          onToggle={toggleService}
        />
      </FilterSection>

      {/* Amenidades con ícono */}
      <FilterSection title="Amenidades" icon="home-outline" spaced>
        <ChipSelector
          options={AMENITY_OPTIONS}
          isActive={(value) => selectedAmenities.includes(value)}
          onToggle={toggleAmenity}
        />
      </FilterSection>

      {/* Características especiales con ícono */}
      <FilterSection title="Características especiales" icon="sparkles-outline" spaced>
        <ChipSelector
          options={SPECIAL_FEATURES}
          isActive={(value) => selectedFeatures.includes(value)}
          onToggle={toggleFeature}
        />
      </FilterSection>

      {/* Estado con ícono */}
      <FilterSection title="Estado" icon="time-outline" spaced>
        <ChipSelector
          options={['Abierto ahora']}
          isActive={() => openNow}
          onToggle={() => setOpenNow(!openNow)}
        />
      </FilterSection>

      {/* Horario con ícono */}
      <FilterSection title="Horario" icon="calendar-outline" spaced>
        <ChipSelector
          options={TIME_OPTIONS}
          isActive={(value) => timeFilter === value}
          onToggle={toggleTime}
        />
      </FilterSection>
    </FilterSheet>
  );
};

export default FiltersSheet;
