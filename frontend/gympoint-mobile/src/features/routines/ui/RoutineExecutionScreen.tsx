import React, { useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useRoutineById } from '../hooks/useRoutineById';
import { Exercise } from '../types';
import { Card, Button, ButtonText } from '@shared/components/ui';

const Screen = styled(SafeAreaView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.bg};
`;

const Header = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(0.5)}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.h1}px;
  font-weight: 800;
`;

const Sub = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
`;

const ProgressBg = styled.View`
  height: 8px; border-radius: 999px; overflow: hidden;
  background: ${({ theme }) => theme.colors.muted};
  margin: ${({ theme }) => theme.spacing(1)}px 0;
`;

const ProgressBar = styled.View<{ pct: number }>`
  width: ${({ pct }) => `${pct}%`}; height: 8px;
  background: ${({ theme }) => theme.colors.primary};
`;

const CardInner = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const ExName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
`;

const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const SetsRow = styled.View`
  flex-direction: row; flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const SetPill = styled.View<{ done?: boolean; current?: boolean }>`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background: ${({ theme, done, current }) =>
    done ? theme.colors.primary
    : current ? theme.colors.card
    : theme.colors.muted};
  border: 1px solid
    ${({ theme, done, current }) =>
      done ? theme.colors.primary
      : current ? theme.colors.border
      : theme.colors.muted};
`;

const SetText = styled.Text<{ done?: boolean }>`
  color: ${({ theme, done }) => (done ? theme.colors.onPrimary : theme.colors.text)};
  font-weight: 600;
`;

const Footer = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  background: ${({ theme }) => theme.colors.bg};
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const OutlineBtn = styled.TouchableOpacity`
  min-height: 48px; align-items: center; justify-content: center;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const OutlineText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

export default function RoutineExecutionScreen({ route, navigation }: any) {
  const id = route?.params?.id as string | undefined;
  const routine = useRoutineById(id);

  const [exIdx, setExIdx] = useState(0);
  const current = routine.exercises[exIdx] as Exercise;

  const totalExercises = routine.exercises.length;
  const [setIdx, setSetIdx] = useState(1);
  const totalSets = useMemo(
    () => (typeof current.sets === 'number' ? current.sets : parseInt(String(current.sets)) || 1),
    [current]
  );

  const [rest, setRest] = useState<number>(0);
  useEffect(() => {
    if (rest <= 0) return;
    const t = setInterval(() => setRest((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [rest]);

  useEffect(() => {
    setSetIdx(1);
  }, [exIdx]);

  const pctRoutine = ((exIdx) / totalExercises) * 100;

  const onSetDone = () => {
    if (setIdx < totalSets) {
      setSetIdx(setIdx + 1);
      setRest(current.rest || 0);
    } else {
      // siguiente ejercicio
      if (exIdx < totalExercises - 1) {
        setExIdx(exIdx + 1);
        setRest(0);
      } else {
        // fin
        navigation?.goBack?.();
      }
    }
  };

  const onPrevExercise = () => setExIdx(i => Math.max(0, i - 1));
  const onNextExercise = () => setExIdx(i => Math.min(totalExercises - 1, i + 1));

  const header = (
    <Header>
      <Title>{routine.name}</Title>
      <Sub>{`Ejercicio ${exIdx + 1} de ${totalExercises}`}</Sub>
      <ProgressBg><ProgressBar pct={pctRoutine} /></ProgressBg>
    </Header>
  );

  return (
    <Screen edges={['top', 'left', 'right']}>
      <FlatList
        data={[current]}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={header}
        renderItem={() => (
          <Card style={{ marginHorizontal: 16 }}>
            <CardInner>
              <ExName>{current.name}</ExName>
              <Meta>{`Series: ${totalSets} • Reps objetivo: ${current.reps} • Descanso: ${current.rest}s`}</Meta>

              <SetsRow>
                {Array.from({ length: totalSets }).map((_, i) => {
                  const idx = i + 1;
                  const done = idx < setIdx;
                  const currentSet = idx === setIdx;
                  return (
                    <SetPill key={idx} done={done} current={currentSet}>
                      <SetText done={done}>{`Serie ${idx}`}</SetText>
                    </SetPill>
                  );
                })}
              </SetsRow>

              {rest > 0 ? <Meta>{`Descanso: ${rest}s`}</Meta> : null}
            </CardInner>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: 96 }}
      />

      <Footer>
        <Button onPress={onSetDone}>
          <ButtonText>{setIdx < totalSets ? 'Marcar serie completa' : (exIdx < totalExercises - 1 ? 'Continuar al siguiente' : 'Finalizar')}</ButtonText>
        </Button>

        <OutlineBtn onPress={onPrevExercise} disabled={exIdx === 0}>
          <OutlineText>Anterior</OutlineText>
        </OutlineBtn>

        <OutlineBtn onPress={onNextExercise} disabled={exIdx === totalExercises - 1}>
          <OutlineText>Siguiente</OutlineText>
        </OutlineBtn>
      </Footer>
    </Screen>
  );
}
