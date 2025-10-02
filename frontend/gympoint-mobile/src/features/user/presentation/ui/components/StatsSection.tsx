/**
 * StatsSection - Sección de estadísticas del usuario
 * Muestra check-ins totales, mayor racha, visitas mensuales y gimnasio favorito
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, StatsCard } from '@shared/components/ui';
import { UserStats } from '../types/UserTypes';

interface StatsSectionProps {
  stats: UserStats;
  isPremium: boolean;
  theme?: any;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats,
  isPremium,
  theme,
}) => {
  const statsData = [
    {
      value: stats.totalCheckIns,
      label: 'Check-ins totales',
      backgroundColor: '#E3F2FD',
      color: '#1976D2',
    },
    {
      value: stats.longestStreak,
      label: 'Mayor racha',
      backgroundColor: '#E8F5E9',
      color: '#388E3C',
    },
    {
      value: stats.monthlyVisits,
      label: 'Visitas este mes',
      backgroundColor: '#F3E8FF',
      color: '#9333EA',
    },
    {
      value: stats.favoriteGym,
      label: 'Gym favorito',
      backgroundColor: '#FFF3E0',
      color: '#E65100',
      isText: true,
    },
  ];

  return (
    <Card>
      {/* Título de la sección */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Feather name="bar-chart-2" size={20} color="#000" />
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
          Estadísticas
        </Text>
      </View>

      {/* Grid de estadísticas */}
      <StatsCard stats={statsData} />

      {/* Mensaje para usuarios Free sobre estadísticas Premium */}
      {!isPremium && (
        <View
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: '#F5F5F5',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: '#666', opacity: 0.7, textAlign: 'center' }}>
            Con Premium desbloqueás estadísticas detalladas y gráficos
          </Text>
        </View>
      )}
    </Card>
  );
};