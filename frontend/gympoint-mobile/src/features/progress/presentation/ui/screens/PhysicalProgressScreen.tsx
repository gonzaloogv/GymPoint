import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import { usePhysicalMeasurements } from '../../hooks/usePhysicalMeasurements';
import { PhysicalProgressHeader } from '../components/PhysicalProgressHeader';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { PhysicalMetrics } from '../components/PhysicalMetrics';
import { ProgressChart } from '../components/ProgressChart';
import { TokenTipsButton } from '../components/TokenTipsButton';
import * as S from './PhysicalProgressScreen.styles';

interface PhysicalProgressScreenProps {
  navigation: any;
  userId?: string;
}

const PhysicalProgressScreen: React.FC<PhysicalProgressScreenProps> = ({
  navigation,
  userId = 'user-1',
}) => {
  const [timeRange, setTimeRange] = useState('90d');
  const { measurements, loading, error } = usePhysicalMeasurements(userId);

  const handleBack = () => {
    navigation?.goBack?.();
  };

  const handleInfo = () => {
    console.log('Show info');
  };

  const handleAddMeasurement = () => {
    console.log('Add measurement');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
        <S.Container style={{ justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </S.Container>
      </SafeAreaView>
    );
  }

  if (error || !measurements) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
        <S.Container style={{ justifyContent: 'center', alignItems: 'center' }}>
          <S.ErrorText>Error al cargar mediciones</S.ErrorText>
        </S.Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <S.Container>
        <PhysicalProgressHeader onBack={handleBack} onInfo={handleInfo} />

        <S.ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <S.Content>
            <S.SelectorContainer>
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </S.SelectorContainer>

            <PhysicalMetrics measurements={measurements} />

            <ProgressChart
              title="Peso vs tiempo"
              data={measurements.weight.history}
              unit={measurements.weight.unit}
              timeRange={timeRange}
            />

            <TokenTipsButton onPress={handleAddMeasurement} />
          </S.Content>
        </S.ScrollView>
      </S.Container>
    </SafeAreaView>
  );
};

export default PhysicalProgressScreen;
