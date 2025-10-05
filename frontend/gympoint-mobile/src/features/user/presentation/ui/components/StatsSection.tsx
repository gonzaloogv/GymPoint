/**
 * StatsSection - Sección de estadísticas del usuario
 * Muestra check-ins totales, mayor racha, visitas mensuales y gimnasio favorito
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, StatsCard } from '@shared/components/ui';
import { palette } from '@shared/styles';
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
      backgroundColor: palette.statsBlue.bg,
      color: palette.statsBlue.text,
    },
    {
      value: stats.longestStreak,
      label: 'Mayor racha',
      backgroundColor: palette.statsGreen.bg,
      color: palette.statsGreen.text,
    },
    {
      value: stats.monthlyVisits,
      label: 'Visitas este mes',
      backgroundColor: palette.statsPurple.bg,
      color: palette.statsPurple.text,
    },
    {
      value: stats.favoriteGym,
      label: 'Gym favorito',
      backgroundColor: palette.statsOrange.bg,
      color: palette.statsOrange.text,
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
            backgroundColor: palette.bgSubtle,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: palette.textGray, opacity: 0.7, textAlign: 'center' }}>
            Con Premium desbloqueás estadísticas detalladas y gráficos
          </Text>
        </View>
      )}
    </Card>
  );
};