/**
 * StatsSection - Sección de estadísticas del usuario
 * Muestra check-ins totales, mayor racha, visitas mensuales y gimnasio favorito
 */

import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Card,
  SectionTitle,
  Title,
  StatBox,
  StatValue,
  StatLabel,
  BodyText,
  SmallText,
} from '../styles/profilesStyles';
import { UserProfile } from '../types/userTypes';
import { AppTheme } from '@config/theme';

interface StatsSectionProps {
  stats: UserProfile;
  isPremium: boolean;
  theme: AppTheme;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats,
  isPremium,
  theme,
}) => {
  return (
    <Card theme={theme}>
      {/* Título de la sección */}
      <SectionTitle theme={theme}>
        <Feather size={20} color={theme.colors.text} />
        <Title theme={theme}>Estadísticas</Title>
      </SectionTitle>

      {/* Grid de estadísticas en 2 columnas */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -theme.spacing(0.5),
        }}
      >
        {/* Check-ins totales */}
        <View style={{ width: '50%', padding: theme.spacing(0.5) }}>
          <StatBox color="#E3F2FD" theme={theme}>
            <StatValue color="#1976D2">{stats.totalCheckIns}</StatValue>
            <StatLabel color="#1976D2">Check-ins totales</StatLabel>
          </StatBox>
        </View>

        {/* Mayor racha */}
        <View style={{ width: '50%', padding: theme.spacing(0.5) }}>
          <StatBox color="#E8F5E9" theme={theme}>
            <StatValue color="#388E3C">{stats.longestStreak}</StatValue>
            <StatLabel color="#388E3C">Mayor racha</StatLabel>
          </StatBox>
        </View>

        {/* Visitas este mes */}
        <View style={{ width: '50%', padding: theme.spacing(0.5) }}>
          <StatBox color="#F3E8FF" theme={theme}>
            <StatValue color="#9333EA">{stats.monthlyVisits}</StatValue>
            <StatLabel color="#9333EA">Visitas este mes</StatLabel>
          </StatBox>
        </View>

        {/* Gimnasio favorito */}
        <View style={{ width: '50%', padding: theme.spacing(0.5) }}>
          <StatBox color="#FFF3E0" theme={theme}>
            <BodyText
              style={{
                fontWeight: 'bold',
                color: '#E65100',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              {stats.favoriteGym}
            </BodyText>
            <StatLabel color="#E65100">Gym favorito</StatLabel>
          </StatBox>
        </View>
      </View>

      {/* Mensaje para usuarios Free sobre estadísticas Premium */}
      {!isPremium && (
        <View
          style={{
            marginTop: theme.spacing(2),
            padding: theme.spacing(1.5),
            backgroundColor: '#F5F5F5',
            borderRadius: theme.radius.sm,
            alignItems: 'center',
          }}
        >
          <SmallText
            style={{
              color: theme.colors.subtext,
              opacity: 0.7,
              textAlign: 'center',
            }}
          >
            Con Premium desbloqueás estadísticas detalladas y gráficos
          </SmallText>
        </View>
      )}
    </Card>
  );
};