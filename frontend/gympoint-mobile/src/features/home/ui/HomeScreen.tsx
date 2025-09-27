// src/features/home/ui/HomeScreen.tsx
import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import FeatherIcon from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Screen } from '@shared/components/ui/Screen';
import { Button, ButtonText } from '@shared/components/ui/Button';
import { Card, CardRow, CardTitle } from '@shared/components/ui/Card';
import { ProgressTrack, ProgressFill } from '@shared/components/ui/ProgressBar';
import { Badge } from '@shared/components/ui/Badge';
import { rad, sp } from '@shared/styles/uiTokens';

/* ---------------- estilos base ---------------- */
const Page = styled.View`
  padding: ${p => sp(p.theme,2)}px;
  gap: ${p => sp(p.theme,2)}px;
`;
const Row = styled.View`flex-direction: row; align-items: center;`;
const SpaceBetween = styled(Row)`justify-content: space-between;`;
const Heading = styled.Text`font-weight:700;color:${p=>p.theme?.colors?.text ?? '#111'};`;
const Subtext = styled.Text`color:${p=>p.theme?.colors?.subtext ?? '#70737A'};`;
const Avatar = styled.View`
  width:40px;height:40px;border-radius:20px;align-items:center;justify-content:center;
  background:${p=>p.theme?.colors?.bg ?? '#f7f8fb'};
  border-width:1px;border-color:${p=>p.theme?.colors?.border ?? '#e5e7eb'};
`;
const TokenPill = styled(Row)`padding:4px 8px;border-radius:10px;background-color:rgba(250,204,21,0.15);`;
const Section = styled.View`gap:${p => sp(p.theme,1)}px;`;
const QuickGrid = styled.View`flex-direction:row;gap:${p => sp(p.theme,1.5)}px;`;
const Quick = styled(Card)`flex:1;align-items:center;padding-vertical:${p => sp(p.theme,2)}px;`;
const Circle = styled.View<{bg?:string}>`
  width:48px;height:48px;border-radius:24px;align-items:center;justify-content:center;
  background-color:${p=>p.bg ?? 'rgba(17,24,39,0.08)'};margin-bottom:${p=>sp(p.theme,1)}px;
`;
// Banners
const Banner = styled(Card)`border-color:#fed7aa;background-color:#fff7ed;`;
const BlueCard = styled(Card)`border-color:#bfdbfe;background-color:#eff6ff;`;
const PurpleCard = styled(Card)`border-color:#ddd6fe;background-color:#f5f3ff;`;
// Botón outline local
const OutlineButton = styled(TouchableOpacity)`
  min-height:40px; padding:10px 14px; border-radius:${p=>rad(p.theme,'lg',12)}px;
  border-width:1px; border-color:${p=>p.theme?.colors?.border ?? '#e5e7eb'};
  align-items:center; justify-content:center;
`;
const OutlineText = styled(Text)`color:${p=>p.theme?.colors?.text ?? '#111'}; font-weight:600;`;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme() as any;

  // usuario “mock” de ejemplo (reemplazá por tu store)
  const user = { name: 'María Gómez', plan: 'Free' as const, tokens: 150, streak: 7 };

  // permisos + ubicación (solo para el banner, SIN consumir APIs de gyms)
  const [perm, setPerm] = React.useState<'granted' | 'denied' | 'prompt'>('prompt');

  React.useEffect(() => {
    (async () => {
      const p = await Location.getForegroundPermissionsAsync();
      setPerm(p.status as any);
    })();
  }, []);

  const requestLocation = async () => {
    const r = await Location.requestForegroundPermissionsAsync();
    setPerm(r.status as any);
  };

  const weeklyGoal = 4;
  const currentProgress = 3;
  const progress = (currentProgress / weeklyGoal) * 100;

  return (
    <Screen
      scroll
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: tabBarHeight + insets.bottom + 8,
        rowGap: 16,
      }}
    >
      <Page>
        {/* Header */}
        <View>
          <SpaceBetween>
            <Row style={{ gap: 12 }}>
              <Avatar>
                <Text style={{ fontWeight: '700', color: theme?.colors?.text ?? '#111' }}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </Avatar>
              <View>
                <Heading>¡Hola, {user.name.split(' ')[0]}!</Heading>
                <Subtext>Usuario {user.plan}</Subtext>
              </View>
            </Row>

            <Row style={{ gap: 8 }}>
              <TokenPill>
                <FeatherIcon name="zap" size={14} color="#a16207" />
                <Text style={{ marginLeft: 4, color: '#a16207', fontWeight: '600' }}>
                  {user.tokens}
                </Text>
              </TokenPill>
              <TouchableOpacity style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
                <FeatherIcon name="bell" size={20} color={theme?.colors?.text ?? '#111'} />
              </TouchableOpacity>
            </Row>
          </SpaceBetween>
        </View>

        {/* Progreso semanal */}
        <Card>
          <CardRow style={{ marginBottom: 8 }}>
            <CardTitle style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <FeatherIcon name="target" size={20} color={theme?.colors?.primary ?? '#111827'} />
              <Text style={{ fontWeight: '600' }}>Progreso semanal</Text>
            </CardTitle>
            <Badge variant="secondary">{currentProgress}/{weeklyGoal}</Badge>
          </CardRow>

          <Section>
            <SpaceBetween>
              <Subtext>Meta semanal</Subtext>
              <Subtext>{currentProgress} de {weeklyGoal} entrenamientos</Subtext>
            </SpaceBetween>

            <ProgressTrack><ProgressFill value={progress} /></ProgressTrack>

            <SpaceBetween>
              <Row style={{ gap: 6 }}>
                <MaterialCommunityIcons name="fire" size={16} color="#ea580c" />
                <Text style={{ color: '#ea580c', fontWeight: '600' }}>Racha: {user.streak} días</Text>
              </Row>
              <Button style={{ minHeight: 40 }}>
                <ButtonText>Ver estadísticas</ButtonText>
              </Button>
            </SpaceBetween>
          </Section>
        </Card>

        {/* Acciones rápidas */}
        <QuickGrid>
          <Quick>
            <Circle bg="rgba(99,91,255,0.12)">
              <FeatherIcon name="map-pin" size={24} color={theme?.colors?.primary ?? '#635bff'} />
            </Circle>
            <Heading style={{ marginBottom: 2 }}>Encontrar gym</Heading>
            <Subtext>Cerca de ti</Subtext>
          </Quick>

          <Quick>
            <Circle bg="rgba(16,185,129,0.12)">
              <FeatherIcon name="activity" size={24} color="#10b981" />
            </Circle>
            <Heading style={{ marginBottom: 2 }}>Mis rutinas</Heading>
            <Subtext>Entrenamientos</Subtext>
          </Quick>
        </QuickGrid>

        {/* Banner de ubicación */}
        {perm !== 'granted' && (
          <Banner>
            <Row style={{ alignItems: 'flex-start', gap: 12 }}>
              <FeatherIcon name="map-pin" size={20} color="#ea580c" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#7c2d12', fontWeight: '600', marginBottom: 2 }}>Activar ubicación</Text>
                <Text style={{ color: '#9a3412', marginBottom: 8 }}>
                  Permitinos acceder a tu ubicación para encontrar gimnasios cercanos
                </Text>
                <OutlineButton onPress={requestLocation}>
                  <OutlineText>Activar ubicación</OutlineText>
                </OutlineButton>
              </View>
            </Row>
          </Banner>
        )}

        {/* 🔥 Se eliminó la sección “Gimnasios cercanos” */}

        {/* Desafío de hoy */}
        <BlueCard>
          <Row style={{ gap: 12 }}>
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

        {/* Upsell Premium */}
        {user.plan === 'Free' && (
          <PurpleCard>
            <Row style={{ alignItems: 'flex-start', gap: 12 }}>
              <FeatherIcon name="zap" size={20} color="#7c3aed" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#4c1d95', fontWeight: '700', marginBottom: 2 }}>Upgrade a Premium</Text>
                <Text style={{ color: '#5b21b6', marginBottom: 8 }}>
                  Accedé a rutinas personalizadas, métricas avanzadas y más recompensas
                </Text>
                <OutlineButton>
                  <OutlineText>Ver planes</OutlineText>
                </OutlineButton>
              </View>
            </Row>
          </PurpleCard>
        )}
      </Page>
    </Screen>
  );
}
