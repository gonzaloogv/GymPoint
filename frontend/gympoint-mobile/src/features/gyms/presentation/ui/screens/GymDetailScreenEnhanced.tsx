import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { Gym } from '../../../domain/entities/Gym';

interface GymDetailScreenEnhancedProps {
  gym: Gym;
  onBack: () => void;
  onCheckIn: () => void;
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const Section = styled.View`
  padding: 16px;
  margin-bottom: 8px;
`;

const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 16px;
  margin: 8px 16px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 2;
`;

const CardHeader = styled.View`
  margin-bottom: 12px;
`;

const CardTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const HeroSection = styled.View`
  height: 180px;
  background-color: ${({ theme }) => theme.colors.primary}15;
  border-radius: 12px;
  margin: 16px;
  justify-content: center;
  align-items: center;
`;

const HeroContent = styled.View`
  align-items: center;
`;

const HeroIcon = styled.View`
  width: 64px;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.primary}30;
  border-radius: 32px;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const HeroText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const BasicInfoSection = styled.View`
  padding: 16px;
`;

const GymName = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const Description = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 12px;
  line-height: 20px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const InfoText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 8px;
  flex: 1;
`;

const Badge = styled.View<{ variant?: 'primary' | 'secondary' | 'success' | 'warning' }>`
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary + '20';
      case 'success':
        return '#4CAF50' + '20';
      case 'warning':
        return '#FF9800' + '20';
      default:
        return theme.colors.muted;
    }
  }};
  border: 1px solid
    ${({ theme, variant }) => {
      switch (variant) {
        case 'primary':
          return theme.colors.primary + '40';
        case 'success':
          return '#4CAF50' + '40';
        case 'warning':
          return '#FF9800' + '40';
        default:
          return theme.colors.border;
      }
    }};
  border-radius: 16px;
  padding: 4px 12px;
  margin-left: 8px;
`;

const BadgeText = styled.Text<{ variant?: 'primary' | 'secondary' | 'success' | 'warning' }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      default:
        return theme.colors.text;
    }
  }};
`;

const Button = styled.TouchableOpacity<{ variant?: 'primary' | 'outline' | 'disabled' }>`
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'outline':
        return 'transparent';
      case 'disabled':
        return theme.colors.muted;
      default:
        return theme.colors.primary;
    }
  }};
  border: 1px solid
    ${({ theme, variant }) => {
      switch (variant) {
        case 'outline':
          return theme.colors.border;
        case 'disabled':
          return theme.colors.muted;
        default:
          return theme.colors.primary;
      }
    }};
  border-radius: 8px;
  padding: 12px 16px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
`;

const ButtonText = styled.Text<{ variant?: 'primary' | 'outline' | 'disabled' }>`
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'outline':
        return theme.colors.text;
      case 'disabled':
        return theme.colors.textMuted;
      default:
        return theme.colors.onPrimary;
    }
  }};
  font-weight: 600;
  margin-left: 8px;
`;

const PriceCard = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}10;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 12px;
  padding: 20px;
  margin: 8px 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PriceContent = styled.View`
  flex-direction: row;
  align-items: center;
`;

const PriceIcon = styled.View`
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  border-radius: 24px;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const PriceInfo = styled.View``;

const PriceLabel = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const PriceAmount = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const ContactRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 8px;
`;

const ContactText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 8px;
  flex: 1;
`;

const AmenitiesGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const AmenityItem = styled.View`
  flex-direction: row;
  align-items: center;
  width: 48%;
  margin-bottom: 8px;
`;

const AmenityText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 8px;
`;

const RulesList = styled.View`
  gap: 8px;
`;

const RuleItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.muted}30;
  border-radius: 8px;
`;

const RuleText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  margin-left: 8px;
`;

const EquipmentGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const EquipmentBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}15;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 20px;
  padding: 8px 16px;
  margin: 4px;
`;

const EquipmentText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;

const AlertCard = styled.View`
  background-color: #fff3cd;
  border: 1px solid #ffe69c;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 16px;
  flex-direction: row;
  align-items: flex-start;
`;

const AlertText = styled.Text`
  font-size: 14px;
  color: #856404;
  margin-left: 8px;
  flex: 1;
`;

const CheckInButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.muted : theme.colors.primary};
  border-radius: 8px;
  padding: 16px;
  margin: 16px;
  align-items: center;
`;

const CheckInText = styled.Text<{ disabled?: boolean }>`
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textMuted : theme.colors.onPrimary};
  font-size: 16px;
  font-weight: 600;
`;

const CheckInSubtext = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  margin: 8px 16px;
`;

const EmptyState = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  padding: 16px;
`;

export function GymDetailScreenEnhanced({ gym, onBack, onCheckIn }: GymDetailScreenEnhancedProps) {
  const geofenceRadius = gym.geofence_radius_meters || 150;
  const distanceMeters = gym.distancia || 0;
  const isInRange = distanceMeters <= geofenceRadius;

  const openInMaps = () => {
    // Priorizar google_maps_url si existe
    if (gym.google_maps_url) {
      Linking.openURL(gym.google_maps_url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir Google Maps');
      });
    } else {
      // Fallback a coordenadas
      const url = `https://maps.google.com/?q=${gym.lat},${gym.lng}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir Google Maps');
      });
    }
  };

  const handleCall = () => {
    if (gym.phone) {
      Linking.openURL(`tel:${gym.phone}`);
    }
  };

  const handleEmail = () => {
    if (gym.email) {
      Linking.openURL(`mailto:${gym.email}`);
    }
  };

  const handleWebsite = () => {
    if (gym.website) {
      const url = gym.website.startsWith('http') ? gym.website : `https://${gym.website}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir el sitio web');
      });
    }
  };

  return (
    <Container>
      {/* Hero Image */}
      <HeroSection>
        <HeroContent>
          <HeroIcon>
            <Text style={{ fontSize: 32 }}>🏋️</Text>
          </HeroIcon>
          <HeroText>Foto del gimnasio</HeroText>
        </HeroContent>
      </HeroSection>

      {/* Basic Info */}
      <BasicInfoSection>
        <GymName>{gym.name}</GymName>

        {gym.description && <Description>{gym.description}</Description>}

        <InfoRow>
          <Feather name="map-pin" size={16} color="#666" />
          <InfoText>
            {gym.address}
            {gym.city && `, ${gym.city}`}
          </InfoText>
          {gym.distancia !== undefined && (
            <Text style={{ color: '#666' }}>
              • {(gym.distancia / 1000).toFixed(1)} km
            </Text>
          )}
        </InfoRow>

        {gym.verified && (
          <InfoRow>
            <Feather name="check-circle" size={16} color="#4CAF50" />
            <InfoText>Gimnasio verificado</InfoText>
            <Badge variant="success">
              <BadgeText variant="success">Verificado</BadgeText>
            </Badge>
          </InfoRow>
        )}

        {gym.featured && (
          <InfoRow>
            <Feather name="star" size={16} color="#FF9800" />
            <InfoText>Gimnasio destacado</InfoText>
            <Badge variant="warning">
              <BadgeText variant="warning">Destacado</BadgeText>
            </Badge>
          </InfoRow>
        )}

        <Button variant="outline" onPress={openInMaps}>
          <Feather name="external-link" size={16} color="#666" />
          <ButtonText variant="outline">Abrir en Google Maps</ButtonText>
        </Button>
      </BasicInfoSection>

      {/* Price */}
      {gym.monthPrice && (
        <PriceCard>
          <PriceContent>
            <PriceIcon>
              <Feather name="dollar-sign" size={24} color="#4F9CF9" />
            </PriceIcon>
            <PriceInfo>
              <PriceLabel>Precio mensual</PriceLabel>
              <PriceAmount>${gym.monthPrice.toLocaleString('es-AR')}</PriceAmount>
            </PriceInfo>
          </PriceContent>
          <Badge variant="success">
            <BadgeText variant="success">Por mes</BadgeText>
          </Badge>
        </PriceCard>
      )}

      {/* Equipment */}
      {gym.equipment && gym.equipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Equipamiento disponible</CardTitle>
          </CardHeader>
          <EquipmentGrid>
            {gym.equipment.map((item, index) => (
              <EquipmentBadge key={index}>
                <EquipmentText>{item}</EquipmentText>
              </EquipmentBadge>
            ))}
          </EquipmentGrid>
        </Card>
      )}

      {/* Amenities */}
      {gym.amenities && gym.amenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Servicios y comodidades</CardTitle>
          </CardHeader>
          <AmenitiesGrid>
            {gym.amenities.map((amenity) => (
              <AmenityItem key={amenity.id_amenity}>
                <Feather name="check" size={16} color="#4CAF50" />
                <AmenityText>{amenity.name}</AmenityText>
              </AmenityItem>
            ))}
          </AmenitiesGrid>
        </Card>
      )}

      {/* Contact Info */}
      {(gym.phone || gym.email || gym.website) && (
        <Card>
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
          </CardHeader>

          {gym.phone && (
            <ContactRow onPress={handleCall}>
              <Feather name="phone" size={16} color="#666" />
              <ContactText>{gym.phone}</ContactText>
              <Feather name="chevron-right" size={16} color="#666" />
            </ContactRow>
          )}

          {gym.email && (
            <ContactRow onPress={handleEmail}>
              <Feather name="mail" size={16} color="#666" />
              <ContactText>{gym.email}</ContactText>
              <Feather name="chevron-right" size={16} color="#666" />
            </ContactRow>
          )}

          {gym.website && (
            <ContactRow onPress={handleWebsite}>
              <Feather name="globe" size={16} color="#666" />
              <ContactText style={{ color: '#4F9CF9' }}>{gym.website}</ContactText>
              <Feather name="chevron-right" size={16} color="#666" />
            </ContactRow>
          )}
        </Card>
      )}

      {/* Rules */}
      {gym.rules && gym.rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reglas del gimnasio</CardTitle>
          </CardHeader>
          <RulesList>
            {gym.rules.map((rule, index) => (
              <RuleItem key={index}>
                <Feather name="alert-circle" size={16} color="#FF9800" />
                <RuleText>{rule}</RuleText>
              </RuleItem>
            ))}
          </RulesList>
        </Card>
      )}

      {/* Check-in Info */}
      {gym.auto_checkin_enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Información de check-in</CardTitle>
          </CardHeader>
          <InfoRow>
            <Feather name="map-pin" size={16} color="#666" />
            <InfoText>
              Radio de geolocalización: {geofenceRadius}m
            </InfoText>
          </InfoRow>
          {gym.min_stay_minutes && (
            <InfoRow>
              <Feather name="clock" size={16} color="#666" />
              <InfoText>
                Tiempo mínimo de permanencia: {gym.min_stay_minutes} minutos
              </InfoText>
            </InfoRow>
          )}
        </Card>
      )}

      {/* Check-in Alert */}
      {!isInRange && gym.auto_checkin_enabled && (
        <AlertCard>
          <Feather name="alert-triangle" size={16} color="#856404" />
          <AlertText>
            Estás a {distanceMeters.toFixed(0)}m del gimnasio. Necesitás estar dentro de los{' '}
            {geofenceRadius}m para hacer check-in.
          </AlertText>
        </AlertCard>
      )}

      {/* Check-in Button */}
      {gym.auto_checkin_enabled && (
        <>
          <CheckInButton disabled={!isInRange} onPress={onCheckIn}>
            <CheckInText disabled={!isInRange}>
              {isInRange
                ? 'Hacer Check-in'
                : `Acercate ${(distanceMeters - geofenceRadius).toFixed(0)}m más`}
            </CheckInText>
          </CheckInButton>

          <CheckInSubtext>
            Al hacer check-in ganarás +10 tokens y extenderás tu racha
          </CheckInSubtext>
        </>
      )}

      <View style={{ height: 32 }} />
    </Container>
  );
}

