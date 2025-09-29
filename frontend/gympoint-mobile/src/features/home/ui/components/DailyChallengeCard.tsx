import React from 'react';
import styled from 'styled-components/native';
import { View, Text, TouchableOpacity} from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import { Card } from '@shared/components/ui/Card';

const Row = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 12px;
`;
const BlueCard = styled(Card)`
    border-color:#bfdbfe;
    background-color:#eff6ff;
`;

export default function DailyChallengeCard() {
  return (
    <TouchableOpacity style={{ flex: 1}} activeOpacity={0.6}>
        <BlueCard>
        <Row>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
            <FeatherIcon name="award" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
            <Text style={{ color: '#1e3a8a', fontWeight: '700', marginBottom: 2 }}>Desafío de hoy</Text>
            <Text style={{ color: '#1d4ed8' }}>Completá 30 minutos de ejercicio y ganá 15 tokens extra</Text>
            </View>
            <FeatherIcon name="chevron-right" size={18} color="#2563eb" />
        </Row>
        </BlueCard>
    </TouchableOpacity>
  );
}
