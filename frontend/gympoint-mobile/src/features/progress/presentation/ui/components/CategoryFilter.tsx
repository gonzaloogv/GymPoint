import React from 'react';
import styled from 'styled-components/native';
import { SegmentedControl } from '@shared/components/ui/SegmentedControl';

const Container = styled.View`
  margin-bottom: 16px;
`;

const options = [
  { value: 'all', label: 'Todos' },
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilidad' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({ value, onChange }: Props) {
  return (
    <Container>
      <SegmentedControl
        options={options}
        value={value}
        onChange={onChange}
        size="sm"
      />
    </Container>
  );
}
