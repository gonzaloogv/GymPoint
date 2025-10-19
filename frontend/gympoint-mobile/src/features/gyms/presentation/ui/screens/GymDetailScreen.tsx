import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { GymDetailScreenProps } from './GymDetailScreen.types';

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

const RatingRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const RatingText = styled.Text`
  font-weight: 600;
  margin-left: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

const ReviewText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: 4px;
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

const Badge = styled.View<{ variant?: 'primary' | 'secondary' | 'success' }>`
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary + '20';
      case 'success':
        return '#4CAF50' + '20';
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
        default:
          return theme.colors.border;
      }
    }};
  border-radius: 16px;
  padding: 4px 12px;
  margin-left: 8px;
`;

const BadgeText = styled.Text<{ variant?: 'primary' | 'secondary' | 'success' }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'success':
        return '#4CAF50';
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

const ServicesGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const ServiceBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.muted};
  border-radius: 20px;
  padding: 8px 16px;
  margin: 4px;
`;

const ServiceText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
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

const EquipmentItem = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.muted}50;
  border: 1px solid ${({ theme }) => theme.colors.border}50;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const EquipmentContent = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const EquipmentIcon = styled.View`
  width: 40px;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const EquipmentDetails = styled.View`
  flex: 1;
`;

const EquipmentName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const EquipmentSubItems = styled.View`
  margin-left: 52px;
  margin-top: 8px;
`;

const SubItem = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.bg}50;
  border-radius: 6px;
  margin-bottom: 4px;
`;

const SubItemContent = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Dot = styled.View`
  width: 6px;
  height: 6px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 3px;
  margin-right: 8px;
`;

const SubItemText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const SubItemQuantity = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ContactRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const ContactText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 8px;
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
  margin-bottom: 4px;
`;

const AmenityText = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  margin-left: 8px;
`;

const RulesList = styled.View`
  gap: 8px;
`;

const RuleItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
`;

const RuleText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  margin-left: 8px;
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

const ActivityItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const Avatar = styled.View<{ bgColor: string }>`
  width: 32px;
  height: 32px;
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const AvatarText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const ActivityContent = styled.View`
  flex: 1;
`;

const ActivityName = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ActivityTime = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export function GymDetailScreen({ gym, onBack, onCheckIn }: GymDetailScreenProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const isInRange = gym.distance <= 0.15;

  const gymRules = [
    'Toalla obligatoria en equipos',
    'Horario límite: debe ingresar hasta 30min antes del cierre',
    'Protector obligatorio en piscina',
    'No se permite el ingreso con ojotas',
  ];

  const additionalInfo = {
    phone: '+54 11 4567-8900',
    website: 'www.fitmax.com.ar',
    amenities: ['WiFi gratis', 'Estacionamiento', 'Lockers', 'Aire acondicionado'],
  };

  const price = gym.price ?? 30000;
  const equipment = gym.equipment ?? [
    {
      category: 'Máquinas de peso',
      icon: '🏋️',
      items: [
        { name: 'Prensa', quantity: 2 },
        { name: 'Polea', quantity: 3 },
        { name: 'Extensión de piernas', quantity: 3 },
      ],
    },
    {
      category: 'Cardio',
      icon: '🏃',
      items: [
        { name: 'Cintas de correr', quantity: 10 },
        { name: 'Bicicletas fijas', quantity: 5 },
      ],
    },
    {
      category: 'Pesas libres',
      icon: '💪',
      items: [
        { name: 'Mancuernas', quantity: 12 },
        { name: 'Barras', quantity: 8 },
      ],
    },
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const getTotalQuantity = (items: { name: string; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const openInMaps = () => {
    const url = `https://maps.google.com/?q=${gym.coordinates[0]},${gym.coordinates[1]}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${additionalInfo.phone}`);
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

        {gym.rating && (
          <RatingRow>
            <Feather name="star" size={16} color="#FFD700" />
            <RatingText>{gym.rating}</RatingText>
            <ReviewText>(127 reseñas)</ReviewText>
          </RatingRow>
        )}

        <InfoRow>
          <Feather name="map-pin" size={16} color="#666" />
          <InfoText>{gym.address}</InfoText>
          <Text style={{ color: '#666' }}>• {gym.distance.toFixed(1)} km</Text>
        </InfoRow>

        <InfoRow>
          <Feather name="clock" size={16} color="#666" />
          <InfoText>{gym.hours}</InfoText>
          <Badge variant="success">
            <BadgeText variant="success">Abierto ahora</BadgeText>
          </Badge>
        </InfoRow>

        <Button variant="outline" onPress={openInMaps}>
          <Feather name="external-link" size={16} color="#666" />
          <ButtonText variant="outline">Abrir en Maps</ButtonText>
        </Button>
      </BasicInfoSection>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios disponibles</CardTitle>
        </CardHeader>
        <ServicesGrid>
          {gym.services.map((service, index) => (
            <ServiceBadge key={index}>
              <ServiceText>{service}</ServiceText>
            </ServiceBadge>
          ))}
        </ServicesGrid>
      </Card>

      {/* Price */}
      <PriceCard>
        <PriceContent>
          <PriceIcon>
            <Feather name="dollar-sign" size={24} color="#4F9CF9" />
          </PriceIcon>
          <PriceInfo>
            <PriceLabel>Precio mensual</PriceLabel>
            <PriceAmount>${price.toLocaleString('es-AR')}</PriceAmount>
          </PriceInfo>
        </PriceContent>
        <Badge variant="success">
          <BadgeText variant="success">Por mes</BadgeText>
        </Badge>
      </PriceCard>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Maquinaria disponible</CardTitle>
        </CardHeader>
        {equipment.map((category, index) => {
          const isExpanded = expandedCategories.includes(category.category);
          const totalQuantity = getTotalQuantity(category.items);

          return (
            <View key={index}>
              <EquipmentItem onPress={() => toggleCategory(category.category)}>
                <EquipmentContent>
                  <EquipmentIcon>
                    <Text style={{ fontSize: 20 }}>{category.icon}</Text>
                  </EquipmentIcon>
                  <EquipmentDetails>
                    <EquipmentName>{category.category}</EquipmentName>
                  </EquipmentDetails>
                  <Feather
                    name={isExpanded ? 'chevron-down' : 'chevron-right'}
                    size={16}
                    color="#666"
                  />
                </EquipmentContent>
                <Badge>
                  <BadgeText>{totalQuantity}</BadgeText>
                </Badge>
              </EquipmentItem>

              {isExpanded && (
                <EquipmentSubItems>
                  {category.items.map((item, itemIndex) => (
                    <SubItem key={itemIndex}>
                      <SubItemContent>
                        <Dot />
                        <SubItemText>{item.name}</SubItemText>
                      </SubItemContent>
                      <SubItemQuantity>{item.quantity}</SubItemQuantity>
                    </SubItem>
                  ))}
                </EquipmentSubItems>
              )}
            </View>
          );
        })}
      </Card>

      {/* Contact & Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de contacto</CardTitle>
        </CardHeader>

        <TouchableOpacity onPress={handleCall}>
          <ContactRow>
            <Feather name="phone" size={16} color="#666" />
            <ContactText>{additionalInfo.phone}</ContactText>
          </ContactRow>
        </TouchableOpacity>

        <ContactRow>
          <Feather name="globe" size={16} color="#666" />
          <ContactText style={{ color: '#4F9CF9' }}>{additionalInfo.website}</ContactText>
        </ContactRow>

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Comodidades</Text>
          <AmenitiesGrid>
            {additionalInfo.amenities.map((amenity, index) => (
              <AmenityItem key={index}>
                <Feather
                  name={
                    amenity.includes('WiFi')
                      ? 'wifi'
                      : amenity.includes('Estacionamiento')
                        ? 'truck'
                        : amenity.includes('Lockers')
                          ? 'lock'
                          : 'check'
                  }
                  size={12}
                  color="#666"
                />
                <AmenityText>{amenity}</AmenityText>
              </AmenityItem>
            ))}
          </AmenitiesGrid>
        </View>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Reglas del gimnasio</CardTitle>
        </CardHeader>
        <RulesList>
          {gymRules.map((rule, index) => (
            <RuleItem key={index}>
              <Dot />
              <RuleText>{rule}</RuleText>
            </RuleItem>
          ))}
        </RulesList>
      </Card>

      {/* Check-in Alert */}
      {!isInRange && (
        <AlertCard>
          <Feather name="alert-triangle" size={16} color="#856404" />
          <AlertText>
            Estás a {(gym.distance * 1000).toFixed(0)}m del gimnasio. Necesitás estar
            dentro de los 150m para hacer check-in.
          </AlertText>
        </AlertCard>
      )}

      {/* Check-in Button */}
      <CheckInButton disabled={!isInRange} onPress={onCheckIn}>
        <CheckInText disabled={!isInRange}>
          {isInRange
            ? 'Hacer Check-in'
            : `Acercate ${(gym.distance * 1000 - 150).toFixed(0)}m más`}
        </CheckInText>
      </CheckInButton>

      <CheckInSubtext>
        Al hacer check-in ganarás +10 tokens y extenderás tu racha
      </CheckInSubtext>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
        </CardHeader>

        <ActivityItem>
          <Avatar bgColor="#3B82F6">
            <AvatarText>MG</AvatarText>
          </Avatar>
          <ActivityContent>
            <ActivityName>María G.</ActivityName>
            <ActivityTime>Hizo check-in hace 2 horas</ActivityTime>
          </ActivityContent>
          <Badge>
            <BadgeText>Racha 12 días</BadgeText>
          </Badge>
        </ActivityItem>

        <ActivityItem>
          <Avatar bgColor="#10B981">
            <AvatarText>JL</AvatarText>
          </Avatar>
          <ActivityContent>
            <ActivityName>Juan L.</ActivityName>
            <ActivityTime>Hizo check-in hace 4 horas</ActivityTime>
          </ActivityContent>
          <Badge>
            <BadgeText>Racha 5 días</BadgeText>
          </Badge>
        </ActivityItem>

        <ActivityItem>
          <Avatar bgColor="#8B5CF6">
            <AvatarText>AS</AvatarText>
          </Avatar>
          <ActivityContent>
            <ActivityName>Ana S.</ActivityName>
            <ActivityTime>Hizo check-in ayer</ActivityTime>
          </ActivityContent>
          <Badge>
            <BadgeText>Racha 21 días</BadgeText>
          </Badge>
        </ActivityItem>
      </Card>

      <View style={{ height: 32 }} />
    </Container>
  );
}
