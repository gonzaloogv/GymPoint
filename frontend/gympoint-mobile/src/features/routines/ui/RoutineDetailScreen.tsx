import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useRoutineById } from '../hooks/useRoutineById';
import { Routine, Exercise } from '../types';
import { Card, Button, ButtonText } from '@shared/components/ui';

const Screen = styled(SafeAreaView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.bg};
`;

const HeaderWrap = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.h1}px;
  font-weight: 800;
`;

const MetaRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const Pill = styled.View<{ active?: boolean }>`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.card};
  border: 1px solid
    ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.border)};
`;

const PillText = styled.Text<{ active?: boolean }>`
  color: ${({ theme, active }) => (active ? theme.colors.onPrimary : theme.colors.text)};
  font-size: ${({ theme }) => theme.typography.small}px;
  font-weight: 600;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  /* Usa tokens existentes: h2/h1/body/small */
  font-size: ${({ theme }) => theme.typography.body + 4}px;
  margin: ${({ theme }) => theme.spacing(1)}px ${({ theme }) => theme.spacing(2)}px;
`;

const CardInner = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const ExRow = styled.View`
  padding: ${({ theme }) => theme.spacing(1)}px 0;
`;

const ExName = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

const ExMeta = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const Chips = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Chip = styled.View`
  padding: ${({ theme }) => theme.spacing(0.5)}px ${({ theme }) => theme.spacing(1)}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background: ${({ theme }) => theme.colors.muted};
`;

const ChipText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.small}px;
`;

const Separator = styled.View`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing(1)}px 0;
`;

const Footer = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  background: ${({ theme }) => theme.colors.bg};
`;

const OutlineBtn = styled.TouchableOpacity`
  min-height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  margin-top: ${({ theme }) => theme.spacing(1)}px;
`;

const OutlineText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

export default function RoutineDetailScreen({ route, navigation }: any) {
  const id = route?.params?.id as string | undefined;
  const routine: Routine = useRoutineById(id);

  const header = (
    <>
      <HeaderWrap>
        <Title>{routine.name}</Title>
        <MetaRow>
          <Pill active={routine.status === 'Active'}>
            <PillText active={routine.status === 'Active'}>
              {routine.status === 'Active'
                ? 'Activa'
                : routine.status === 'Scheduled'
                  ? 'Programada'
                  : 'Completada'}
            </PillText>
          </Pill>
          <Meta>• {routine.difficulty}</Meta>
          <Meta>• {routine.estimatedDuration} min</Meta>
          {routine.lastPerformed ? <Meta>• Última: {routine.lastPerformed}</Meta> : null}
          {routine.nextScheduled ? <Meta>• Próxima: {routine.nextScheduled}</Meta> : null}
        </MetaRow>
      </HeaderWrap>
      <SectionTitle>Ejercicios</SectionTitle>
    </>
  );

  return (
    <Screen edges={['top', 'left', 'right']}>
      <FlatList
        data={routine.exercises}
        keyExtractor={(e: Exercise) => e.id}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <Separator />}
        renderItem={({ item }) => (
          <Card style={{ marginHorizontal: 16 }}>
            <CardInner>
              <ExRow>
                <ExName>{item.name}</ExName>
                <ExMeta>{`Series: ${item.sets} • Reps: ${item.reps} • Descanso: ${item.rest}s`}</ExMeta>
              </ExRow>
              <Chips>
                {item.muscleGroups.map((m) => (
                  <Chip key={m}>
                    <ChipText>{m}</ChipText>
                  </Chip>
                ))}
              </Chips>
            </CardInner>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: 96 }}
      />

      <Footer>
        <Button
          onPress={() => navigation?.navigate?.('RoutineExecution', { id: routine.id })}
        >
          <ButtonText>Empezar rutina</ButtonText>
        </Button>
        <OutlineBtn
          onPress={() => navigation?.navigate?.('RoutineHistory', { id: routine.id })}
        >
          <OutlineText>Ver historial</OutlineText>
        </OutlineBtn>
      </Footer>
    </Screen>
  );
}
