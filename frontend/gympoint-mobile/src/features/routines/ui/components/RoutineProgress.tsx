import { useMemo } from 'react';
import styled from 'styled-components/native';
import { Card } from '@shared/components/ui';

const Wrap = styled.View`
  padding: 0 ${({ theme }) => theme.spacing(2)}px;
  margin-bottom: ${({ theme }) => theme.spacing(2)}px;
`;

const Inner = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const BarBg = styled.View`
  height: 8px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.muted};
  overflow: hidden;
`;

const Bar = styled.View<{ pct: number }>`
  width: ${({ pct }) => `${pct}%`};
  height: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

type Props = { completed: number; goal: number };

export default function RoutineProgress({ completed, goal }: Props) {
  const pct = useMemo(
    () => Math.max(0, Math.min(100, (completed / Math.max(1, goal)) * 100)),
    [completed, goal],
  );
  return (
    <Wrap>
      <Card>
        <Inner>
          <Row>
            <Label>Progreso semanal</Label>
            <Label>
              {completed}/{goal} entrenamientos
            </Label>
          </Row>
          <BarBg>
            <Bar pct={pct} />
          </BarBg>
        </Inner>
      </Card>
    </Wrap>
  );
}
