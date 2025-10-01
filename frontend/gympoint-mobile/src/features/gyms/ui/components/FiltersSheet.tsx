import React from 'react';

import { PRICE_OPTIONS, SERVICE_OPTIONS, TIME_OPTIONS } from '../../constants/filters';
import {
  SheetOverlay,
  SheetContainer,
  Backdrop,
  SheetBody,
  SheetTitle,
  ContentScroll,
  SectionTitle,
  ChipsGrid,
  Chip,
  ChipText,
  SheetActions,
  OutlineButton,
  SolidButton,
  ButtonText,
} from './FiltersSheet.styles';

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

type OptionChipsProps = {
  options: readonly string[];
  isActive: (value: string) => boolean;
  onToggle: (value: string) => void;
};

const OptionChips: React.FC<OptionChipsProps> = ({ options, isActive, onToggle }) => (
  <ChipsGrid>
    {options.map((option) => {
      const active = isActive(option);
      return (
        <Chip key={option} $active={active} onPress={() => onToggle(option)}>
          <ChipText $active={active}>{option}</ChipText>
        </Chip>
      );
    })}
  </ChipsGrid>
);

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
    <SheetOverlay visible={visible} onRequestClose={onClose}>
      <SheetContainer>
        <Backdrop onPress={onClose} />
        <SheetBody>
          <SheetTitle>Filtros</SheetTitle>

          <ContentScroll>
            <SectionTitle>Servicios</SectionTitle>
            <OptionChips
              options={SERVICE_OPTIONS}
              isActive={(value) => selectedServices.includes(value)}
              onToggle={toggleService}
            />

            <SectionTitle $spaced>Precio</SectionTitle>
            <OptionChips
              options={PRICE_OPTIONS}
              isActive={(value) => priceFilter === value}
              onToggle={togglePrice}
            />

            <SectionTitle $spaced>Estado</SectionTitle>
            <OptionChips
              options={["Abierto ahora"]}
              isActive={() => openNow}
              onToggle={() => setOpenNow(!openNow)}
            />

            <SectionTitle $spaced>Horario</SectionTitle>
            <OptionChips
              options={TIME_OPTIONS}
              isActive={(value) => timeFilter === value}
              onToggle={toggleTime}
            />

            <SheetActions>
              <OutlineButton onPress={handleClear}>
                <ButtonText>Limpiar</ButtonText>
              </OutlineButton>
              <SolidButton onPress={handleApply}>
                <ButtonText $solid>Aplicar</ButtonText>
              </SolidButton>
            </SheetActions>
          </ContentScroll>
        </SheetBody>
      </SheetContainer>
    </SheetOverlay>
  );
};

export default FiltersSheet;
