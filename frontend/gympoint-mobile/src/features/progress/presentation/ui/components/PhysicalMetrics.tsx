import React from 'react';
import { PhysicalMeasurements } from '@features/progress/domain/entities';
import { MetricCard } from './MetricCard';
import * as S from '../screens/PhysicalProgressScreen.styles';

interface PhysicalMetricsProps {
  measurements: PhysicalMeasurements;
}

export const PhysicalMetrics: React.FC<PhysicalMetricsProps> = ({ measurements }) => {
  const { weight, bodyFat, imc, streak } = measurements;

  return (
    <>
      <S.MetricsRow>
        <MetricCard
          icon="⚖️"
          label="Peso"
          value={weight.current.toString()}
          change={weight.change}
          unit="kg"
        />
        <MetricCard
          icon="💧"
          label="% Grasa"
          value={bodyFat.current.toString()}
          change={bodyFat.change}
          unit="%"
        />
      </S.MetricsRow>

      <S.MetricsRow>
        <MetricCard
          icon="📊"
          label="IMC"
          value={imc.current.toString()}
          change={imc.change}
        />
        <MetricCard
          icon="🔥"
          label="Racha"
          value={`${streak.days} días`}
          change={streak.change}
        />
      </S.MetricsRow>
    </>
  );
};
