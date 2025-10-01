// src/features/gyms/ui/components/FiltersSheet.tsx
import { Modal, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import styled from 'styled-components/native'; // 👈 importante: native
import { rad, sp } from '@shared/styles/uiTokens';

// ====== estilos ======
const SheetContainer = styled(View)`
  flex: 1;
  justify-content: flex-end;
  background-color: rgba(0,0,0,0.25);
`;

const SheetBody = styled(View)`
  max-height: 70%;
  background-color: ${({ theme }) => theme?.colors?.card ?? '#fff'};
  border-top-left-radius: ${({ theme }) => rad(theme, 'lg', 16)}px;
  border-top-right-radius: ${({ theme }) => rad(theme, 'lg', 16)}px;
  padding: ${({ theme }) => sp(theme, 2)}px;
`;

const SheetTitle = styled(Text)` font-weight: 700; font-size: 16px; margin-bottom: 8px; `;
const SectionTitle = styled(Text)` font-weight: 600; margin-bottom: 8px; `;
const ChipsGrid = styled(View)` flex-direction: row; flex-wrap: wrap; gap: 8px; `;

const Chip = styled(TouchableOpacity)<{ active?: boolean }>`
  padding: 8px 12px;
  border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  border-width: 1px;
  border-color: ${({ theme, active }) => active ? (theme?.colors?.primary ?? '#635BFF') : (theme?.colors?.border ?? '#e5e7eb')};
  background-color: ${({ theme, active }) => active ? (theme?.colors?.primary ?? '#635BFF') : (theme?.colors?.bg ?? '#fafafa')};
`;

const ChipText = styled(Text)<{ active?: boolean }>`
  color: ${({ theme, active }) => active ? '#fff' : (theme?.colors?.text ?? '#111')};
  font-weight: 600;
`;

const SheetActions = styled(View)` flex-direction: row; gap: 10px; margin-top: 12px; `;

const OutlineButton = styled(TouchableOpacity)`
  flex: 1; align-items: center; justify-content: center;
  min-height: 40px; border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  border-width: 1px; border-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
`;

const SolidButton = styled(TouchableOpacity)`
  flex: 1; align-items: center; justify-content: center;
  min-height: 40px; border-radius: ${({ theme }) => rad(theme, 'md', 12)}px;
  background-color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
`;

const BtnText = styled(Text)<{ solid?: boolean }>`
  color: ${({ solid }) => solid ? '#fff' : '#111'};
  font-weight: 600;
`;

// ====== constantes (podés moverlas a @features/gyms/constants/filters.ts más adelante) ======
export const SERVICE_OPTIONS = ['Pesas', 'Cardio', 'Clases', 'Pileta', 'Functional', 'Spa', '24hs', 'Nutrición'];
export const PRICE_OPTIONS   = ['Gratis', '$5000-12000', '$12000-20000', '$20000+'];
export const TIME_OPTIONS    = ['Mañana (6-12)', 'Tarde (12-18)', 'Noche (18-24)', '24 horas'];

// ====== tipos de props ======
type FiltersSheetProps = {
  visible: boolean;
  onClose: () => void;

  selectedServices: string[];
  setSelectedServices: (s: string[]) => void;

  priceFilter: string;
  setPriceFilter: (v: string) => void;

  // 👇 CAMBIO: separo “Abierto ahora” del timeFilter
  openNow: boolean;
  setOpenNow: (v: boolean) => void;


  timeFilter: string;
  setTimeFilter: (v: string) => void;

  onClear?: () => void; // opcional, si querés enganchar un clear externo
  onApply?: () => void; // opcional, si querés hacer algo extra al aplicar
};

export default function FiltersSheet({
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
}: FiltersSheetProps) {

  const handleToggleService = (service: string) => {
    const active = selectedServices.includes(service);
    setSelectedServices(active ? selectedServices.filter(s => s !== service) : [...selectedServices, service]);
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SheetContainer>
        {/* Tocar fondo cierra */}
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <SheetBody>
          <SheetTitle>Filtros</SheetTitle>

          <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
            {/* Servicios */}
            <SectionTitle>Servicios</SectionTitle>
            <ChipsGrid>
              {SERVICE_OPTIONS.map((s) => {
                const active = selectedServices.includes(s);
                return (
                  <Chip key={s} active={active} onPress={() => handleToggleService(s)}>
                    <ChipText active={active}>{s}</ChipText>
                  </Chip>
                );
              })}
            </ChipsGrid>

            {/* Precio */}
            <SectionTitle style={{ marginTop: 16 }}>Precio</SectionTitle>
            <ChipsGrid>
              {PRICE_OPTIONS.map((p) => {
                const active = priceFilter === p;
                return (
                  <Chip key={p} active={active} onPress={() => setPriceFilter(active ? '' : p)}>
                    <ChipText active={active}>{p}</ChipText>
                  </Chip>
                );
              })}
            </ChipsGrid>

            {/*Estado Actual */}
            <SectionTitle style={{ marginTop: 16 }}>Estado</SectionTitle>
            <ChipsGrid>
              <Chip active={openNow} onPress={() => setOpenNow(!openNow)}>
                <ChipText active={openNow}>Abierto ahora</ChipText>
              </Chip>
            </ChipsGrid>

            {/* Horario */}
            <SectionTitle style={{ marginTop: 16 }}>Horario</SectionTitle>
            <ChipsGrid>
              {TIME_OPTIONS.map((t) => {
                const active = timeFilter === t;
                return (
                  <Chip key={t} active={active} onPress={() => setTimeFilter(active ? '' : t)}>
                    <ChipText active={active}>{t}</ChipText>
                  </Chip>
                );
              })}
            </ChipsGrid>

            {/* Acciones */}
            <SheetActions>
              <OutlineButton onPress={handleClear}>
                <BtnText>Limpiar</BtnText>
              </OutlineButton>
              <SolidButton onPress={handleApply}>
                <BtnText solid>Aplicar</BtnText>
              </SolidButton>
            </SheetActions>
          </ScrollView>
        </SheetBody>
      </SheetContainer>
    </Modal>
  );
}
