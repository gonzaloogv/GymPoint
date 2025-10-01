import React from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, ButtonText } from '@shared/components/ui/Button';
import { Card, CardRow, CardTitle } from '@shared/components/ui/Card';
import { ProgressTrack, ProgressFill } from '@shared/components/ui/ProgressBar';
import { Badge } from '@shared/components/ui/Badge';

const Row = styled.View`flex-direction: row; align-items: center;`;
const SpaceBetween = styled(Row)`justify-content: space-between;`;
const Subtext = styled.Text`color:${p=>p.theme?.colors?.subtext ?? '#70737A'};`;

type Props = {
  current: number;
  goal: number;
  progressPct: number; // 0..100
  streak: number;
  onStats?: () => void;
};

export default function WeeklyProgressCard({ current, goal, progressPct, streak, onStats }: Props) {
  return (
    <Card>
      <CardRow style={{ marginBottom: 8 }}>
        <CardTitle style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FeatherIcon name="target" size={20} color={'#111827'} />
          <Text style={{ fontWeight: '600' }}>Progreso semanal</Text>
        </CardTitle>
        <Badge variant="secondary">{current}/{goal}</Badge>
      </CardRow>

      <View style={{ gap: 8 }}>
        <SpaceBetween>
          <Subtext>Meta semanal</Subtext>
          <Subtext>{current} de {goal} entrenamientos</Subtext>
        </SpaceBetween>

        <ProgressTrack><ProgressFill value={progressPct} /></ProgressTrack>

        <SpaceBetween>
          <Row style={{ gap: 6 }}>
            <MaterialCommunityIcons name="fire" size={16} color="#ea580c" />
            <Text style={{ color: '#ea580c', fontWeight: '600' }}>Racha: {streak} días</Text>
          </Row>
          <Button style={{ minHeight: 40 }} onPress={onStats}>
            <ButtonText style={{ color: '#ffffff'}}>Ver estadísticas</ButtonText>
          </Button>
        </SpaceBetween>
      </View>
    </Card>
  );
}
