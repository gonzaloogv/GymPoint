// src/features/progress/presentation/ui/screens/TokenHistoryScreen.tsx
import { useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Screen } from '@shared/components/ui/Screen';
import { EmptyState } from '@shared/components/ui/EmptyState';
import { useTokenHistory } from '../../hooks/useTokenHistory';
import { TokenSummaryCards } from '../components/TokenSummaryCards';
import { MovementTypeFilter } from '../components/MovementTypeFilter';
import { PeriodSelector } from '../components/PeriodSelector';
import { MovementItem } from '../components/MovementItem';
import { TokenHistoryHeader } from '../components/TokenHistoryHeader';

type Props = {
  navigation?: any;
  route?: {
    params?: {
      userId?: string;
    };
  };
};

const Container = styled(View)`
  flex: 1;
  background-color: #f9fafb;
`;

const FilterContainer = styled(View)`
  padding: 16px;
  background-color: #fff;
  border-bottom-width: 1px;
  border-bottom-color: #f3f4f6;
  align-items: center;
`;

const SectionTitle = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: #111;
  padding: 16px;
  background-color: #f9fafb;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const periodOptions = [
  { label: 'Últimos 7 días', value: '7' },
  { label: 'Últimos 30 días', value: '30' },
  { label: 'Últimos 90 días', value: '90' },
  { label: 'Últimos 12 meses', value: '365' },
];

const ModalOverlay = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: flex-end;
`;

const ModalContent = styled(View)`
  background-color: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 24px 16px;
  padding-bottom: 32px;
`;

const ModalTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 20px;
  text-align: left;
`;

const OptionButton = styled(TouchableOpacity)<{ selected: boolean }>`
  padding: 14px 16px;
  border-radius: 8px;
  margin-bottom: 4px;
  background-color: ${({ selected }) => (selected ? '#4F46E5' : 'transparent')};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const OptionText = styled(Text)<{ selected: boolean }>`
  font-size: 15px;
  font-weight: ${({ selected }) => (selected ? '500' : '400')};
  color: ${({ selected }) => (selected ? '#fff' : '#111')};
`;

export function TokenHistoryScreen({ navigation, route }: Props) {
  const userId = route?.params?.userId ?? '1';
  const [movementType, setMovementType] = useState('all');
  const [period, setPeriod] = useState('Últimos 30 días');
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const { movements, summary, loading, error } = useTokenHistory(userId);

  const handleBack = () => {
    navigation?.goBack?.();
  };

  const handlePeriodPress = () => {
    setShowPeriodModal(true);
  };

  const handlePeriodSelect = (selectedPeriod: string) => {
    setPeriod(selectedPeriod);
    setShowPeriodModal(false);
  };

  const filteredMovements = useMemo(() => {
    if (movementType === 'all') return movements;
    return movements.filter((m) => m.type === movementType);
  }, [movements, movementType]);

  if (loading) {
    return (
      <Screen>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#635BFF" />
        </LoadingContainer>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <TokenHistoryHeader onBack={handleBack} />
        <EmptyState
          title="Error al cargar"
          description={error}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Container>
        <TokenHistoryHeader onBack={handleBack} />

        {summary && (
          <TokenSummaryCards
            available={summary.available}
            totalEarned={summary.totalEarned}
            totalSpent={summary.totalSpent}
          />
        )}

        <FilterContainer>
          <MovementTypeFilter value={movementType} onChange={setMovementType} />
        </FilterContainer>

        <PeriodSelector value={period} onPress={handlePeriodPress} />

        <SectionTitle>Movimientos</SectionTitle>

        <FlatList
          data={filteredMovements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MovementItem movement={item} />}
          ListEmptyComponent={
            <EmptyState
              title="No hay movimientos"
              description="No se encontraron movimientos en este período"
            />
          }
        />

        <Modal
          visible={showPeriodModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPeriodModal(false)}
        >
          <ModalOverlay>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setShowPeriodModal(false)}
            />
            <ModalContent>
              <ModalTitle>Período de tiempo</ModalTitle>
              {periodOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  selected={period === option.label}
                  onPress={() => handlePeriodSelect(option.label)}
                >
                  <OptionText selected={period === option.label}>
                    {option.label}
                  </OptionText>
                  {period === option.label && (
                    <FeatherIcon name="check" size={20} color="#fff" />
                  )}
                </OptionButton>
              ))}
            </ModalContent>
          </ModalOverlay>
        </Modal>
      </Container>
    </Screen>
  );
}
