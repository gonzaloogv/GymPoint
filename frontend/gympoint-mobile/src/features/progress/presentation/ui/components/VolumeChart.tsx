import React from 'react';
import styled from 'styled-components/native';
import { WeeklyVolume } from '@features/progress/domain/entities';

const Container = styled.View`
  margin-vertical: 16px;
`;

const ChartContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  height: 120px;
  padding-horizontal: 8px;
`;

const Bar = styled.View<{ height: number }>`
  flex: 1;
  margin-horizontal: 4px;
  background-color: ${({ theme }) => theme?.colors?.primary ?? '#635BFF'};
  border-radius: 4px;
  height: ${({ height }) => height}%;
  min-height: 4px;
`;

const BarWrapper = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
`;

const DayLabel = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme?.colors?.subtext ?? '#6b7280'};
  margin-top: 8px;
  text-align: center;
`;

const VolumeLabel = styled.Text`
  font-size: 9px;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  margin-bottom: 4px;
  font-weight: 600;
`;

interface Props {
  data: WeeklyVolume[];
}

export function VolumeChart({ data }: Props) {
  const maxVolume = Math.max(...data.map((d) => d.volume));

  return (
    <Container>
      <ChartContainer>
        {data.map((item, index) => {
          const height = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0;
          return (
            <BarWrapper key={index}>
              {item.volume > 0 && (
                <VolumeLabel>{Math.round(item.volume)}</VolumeLabel>
              )}
              <Bar height={height} />
              <DayLabel>{item.day}</DayLabel>
            </BarWrapper>
          );
        })}
      </ChartContainer>
    </Container>
  );
}
