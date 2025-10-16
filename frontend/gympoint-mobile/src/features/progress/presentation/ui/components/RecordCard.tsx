import React from 'react';
import styled from 'styled-components/native';
import { PersonalRecord, BestSerie } from '@features/progress/domain/entities';

const Container = styled.View`
  background-color: ${({ theme }) => theme?.colors?.card ?? '#fff'};
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? '#e5e7eb'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  margin-bottom: 12px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Label = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme?.colors?.subtext ?? '#6b7280'};
`;

const Value = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
`;

const DateText = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme?.colors?.subtext ?? '#9ca3af'};
  margin-top: 4px;
`;

interface Props {
  type: 'PR' | 'BestSerie';
  record?: PersonalRecord;
  bestSerie?: BestSerie;
}

export function RecordCard({ type, record, bestSerie }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  if (type === 'PR' && record) {
    return (
      <Container>
        <Title>🏆 Records Personales</Title>
        <Row>
          <Label>Peso máximo</Label>
          <Value>{record.maxWeight} kg</Value>
        </Row>
        <Row>
          <Label>Repeticiones máximas</Label>
          <Value>{record.maxReps} reps</Value>
        </Row>
        <Row>
          <Label>Volumen máximo</Label>
          <Value>{record.maxVolume} kg</Value>
        </Row>
        <DateText>Última actualización: {formatDate(record.date)}</DateText>
      </Container>
    );
  }

  if (type === 'BestSerie' && bestSerie) {
    return (
      <Container>
        <Title>⭐ Mejor Serie</Title>
        <Row>
          <Label>Peso</Label>
          <Value>{bestSerie.weight} kg</Value>
        </Row>
        <Row>
          <Label>Repeticiones</Label>
          <Value>{bestSerie.reps} reps</Value>
        </Row>
        <DateText>Fecha: {formatDate(bestSerie.date)}</DateText>
      </Container>
    );
  }

  return null;
}
