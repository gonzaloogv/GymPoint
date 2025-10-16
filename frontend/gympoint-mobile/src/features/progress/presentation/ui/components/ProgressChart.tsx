import React from 'react';
import { MeasurementPoint } from '@features/progress/domain/entities';
import * as S from './ProgressChart.styles';

interface ProgressChartProps {
  title: string;
  data: MeasurementPoint[];
  unit: string;
  timeRange: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  data,
  unit,
  timeRange,
}) => {
  const minValue = Math.min(...data.map((d) => d.value));
  const maxValue = Math.max(...data.map((d) => d.value));
  const avgValue = (data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1);

  return (
    <S.Container>
      <S.Title>{title}</S.Title>
      <S.ChartPlaceholder>
        <S.ChartIcon>📊</S.ChartIcon>
        <S.ChartText>Gráfico de progreso</S.ChartText>
        <S.ChartInfo>
          {data.length} mediciones en {timeRange}
        </S.ChartInfo>
      </S.ChartPlaceholder>
      <S.SummaryRow>
        <S.SummaryItem>
          <S.SummaryLabel>Mínimo</S.SummaryLabel>
          <S.SummaryValue>
            {minValue}
            {unit}
          </S.SummaryValue>
        </S.SummaryItem>
        <S.SummaryItem>
          <S.SummaryLabel>Promedio</S.SummaryLabel>
          <S.SummaryValue>
            {avgValue}
            {unit}
          </S.SummaryValue>
        </S.SummaryItem>
        <S.SummaryItem>
          <S.SummaryLabel>Máximo</S.SummaryLabel>
          <S.SummaryValue>
            {maxValue}
            {unit}
          </S.SummaryValue>
        </S.SummaryItem>
      </S.SummaryRow>
    </S.Container>
  );
};
