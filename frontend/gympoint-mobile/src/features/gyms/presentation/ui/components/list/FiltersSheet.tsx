import React from 'react';
import {
  PRICE_OPTIONS,
  SERVICE_OPTIONS,
  TIME_OPTIONS,
} from '@features/gyms/domain/constants/filters';
import { FilterSheet, ChipSelector } from '@shared/components/ui';

type FiltersSheetProps = {
  visible: boolean;
  onClose: () => void;
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  priceFilter: string;
  setPriceFilter: (price: string) => void;
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
  priceFilter,
  setPriceFilter,
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

  const togglePrice = (price: string) => {
    setPriceFilter(priceFilter === price ? '' : price);
  };

  const toggleTime = (time: string) => {
    setTimeFilter(timeFilter === time ? '' : time);
  };

  const handleClear = () => {
    setSelectedServices([]);
    setPriceFilter('');
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
      <ChipSelector
        title="Servicios"
        options={SERVICE_OPTIONS}
        isActive={(value) => selectedServices.includes(value)}
        onToggle={toggleService}
      />

      <ChipSelector
        title="Precio"
        options={PRICE_OPTIONS}
        isActive={(value) => priceFilter === value}
        onToggle={togglePrice}
        spaced
      />

      <ChipSelector
        title="Estado"
        options={['Abierto ahora']}
        isActive={() => openNow}
        onToggle={() => setOpenNow(!openNow)}
        spaced
      />

      <ChipSelector
        title="Horario"
        options={TIME_OPTIONS}
        isActive={(value) => timeFilter === value}
        onToggle={toggleTime}
        spaced
      />
    </FilterSheet>
  );
};

export default FiltersSheet;
