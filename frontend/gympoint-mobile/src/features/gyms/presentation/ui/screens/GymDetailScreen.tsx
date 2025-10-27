import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GymDetailScreenProps } from './GymDetailScreen.types';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';


export function GymDetailScreen({ gym, onBack, onCheckIn }: GymDetailScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
    <Screen
      scroll={true}
      safeAreaTop={true}
      safeAreaBottom={false}
    >
      {/* Hero Image - Now respects status bar safe area */}
      <View className={`h-44 ${isDark ? 'bg-primary/20' : 'bg-primary/20'} rounded-xl mx-4 mt-4 justify-center items-center`}>
        <View className="items-center">
          <View className={`w-16 h-16 ${isDark ? 'bg-primary/30' : 'bg-primary/30'} rounded-full justify-center items-center mb-2`}>
            <Text style={{ fontSize: 32 }}>🏋️</Text>
          </View>
          <Text className={`text-sm ${isDark ? 'text-textMuted-dark' : 'text-textMuted'}`}>Foto del gimnasio</Text>
        </View>
      </View>

      {/* Basic Info */}
      <View className="px-4 py-4">
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
          {gym.name}
        </Text>

        {gym.rating && (
          <View className="flex-row items-center mb-3">
            <Feather name="star" size={16} color="#FFD700" />
            <Text className={`font-semibold ml-1 ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
              {gym.rating}
            </Text>
            <Text className={`text-sm ml-1 ${isDark ? 'text-textMuted-dark' : 'text-textMuted'}`}>
              (127 reseñas)
            </Text>
          </View>
        )}

        <View className="flex-row items-center mb-2">
          <Feather name="map-pin" size={16} color="#666" />
          <Text className={`text-sm ml-2 flex-1 ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
            {gym.address}
          </Text>
          <Text className="text-sm text-gray-600">• {gym.distance.toFixed(1)} km</Text>
        </View>

        <View className="flex-row items-center mb-2">
          <Feather name="clock" size={16} color="#666" />
          <Text className={`text-sm ml-2 flex-1 ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
            {gym.hours}
          </Text>
          <View className="bg-green-500/20 border border-green-500/40 rounded-2xl px-3 py-1 ml-2">
            <Text className="text-xs font-semibold text-green-600">Abierto ahora</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-center mt-3"
          onPress={openInMaps}
        >
          <Feather name="external-link" size={16} color="#666" />
          <Text className={`ml-2 font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
            Abrir en Maps
          </Text>
        </TouchableOpacity>
      </View>

      {/* Services */}
      <View className={`${isDark ? 'bg-card-dark' : 'bg-card'} rounded-xl p-4 mx-2 my-2 shadow-sm`}>
        <View className="mb-3">
          <Text className={`text-lg font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
            Servicios disponibles
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {gym.services.map((service, index) => (
            <View key={index} className={`${isDark ? 'bg-muted-dark' : 'bg-muted'} rounded-full px-4 py-2 m-1`}>
              <Text className={`text-sm text-center ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
                {service}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Price */}
      <View className={`${isDark ? 'bg-primary/10 border-primary/30' : 'bg-primary/10 border-primary/30'} border rounded-xl p-5 mx-2 my-2 flex-row items-center justify-between`}>
        <View className="flex-row items-center">
          <View className={`w-12 h-12 ${isDark ? 'bg-primary/20' : 'bg-primary/20'} rounded-full justify-center items-center mr-4`}>
            <Feather name="dollar-sign" size={24} color="#4F9CF9" />
          </View>
          <View>
            <Text className={`text-sm ${isDark ? 'text-textMuted-dark' : 'text-textMuted'}`}>Precio mensual</Text>
            <Text className={`text-2xl font-bold ${isDark ? 'text-primary-dark' : 'text-primary'}`}>
              ${price.toLocaleString('es-AR')}
            </Text>
          </View>
        </View>
        <View className="bg-green-500/20 border border-green-500/40 rounded-2xl px-3 py-1">
          <Text className="text-xs font-semibold text-green-600">Por mes</Text>
        </View>
      </View>

      {/* Equipment */}
      <View className={`${isDark ? 'bg-card-dark' : 'bg-card'} rounded-xl p-4 mx-2 my-2 shadow-sm`}>
        <View className="mb-3">
          <Text className={`text-lg font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
            Maquinaria disponible
          </Text>
        </View>
        {equipment.map((category, index) => {
          const isExpanded = expandedCategories.includes(category.category);
          const totalQuantity = getTotalQuantity(category.items);

          return (
            <View key={index}>
              <TouchableOpacity 
                className={`${isDark ? 'bg-muted/50 border-border/50' : 'bg-muted/50 border-border/50'} border rounded-lg p-3 mb-2 flex-row items-center justify-between`}
                onPress={() => toggleCategory(category.category)}
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-10 h-10 ${isDark ? 'bg-primary/20' : 'bg-primary/20'} rounded-lg justify-center items-center mr-3`}>
                    <Text style={{ fontSize: 20 }}>{category.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
                      {category.category}
                    </Text>
                  </View>
                  <Feather
                    name={isExpanded ? 'chevron-down' : 'chevron-right'}
                    size={16}
                    color="#666"
                  />
                </View>
                <View className={`${isDark ? 'bg-muted-dark' : 'bg-muted'} rounded-2xl px-3 py-1 ml-2`}>
                  <Text className={`text-xs font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
                    {totalQuantity}
                  </Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View className="ml-13 mt-2">
                  {category.items.map((item, itemIndex) => (
                    <View key={itemIndex} className="flex-row items-center justify-between p-2 bg-bg/50 rounded-md mb-1">
                      <View className="flex-row items-center">
                        <View className={`w-1.5 h-1.5 ${isDark ? 'bg-primary-dark' : 'bg-primary'} rounded-full mr-2`} />
                        <Text className={`text-sm ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
                          {item.name}
                        </Text>
                      </View>
                      <Text className={`text-sm ${isDark ? 'text-textMuted-dark' : 'text-textMuted'}`}>
                        {item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Contact & Info */}
      <View className={`${isDark ? 'bg-card-dark' : 'bg-card'} rounded-xl p-4 mx-2 my-2 shadow-sm`}>
        <View className="mb-3">
          <Text className={`text-lg font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
            Información de contacto
          </Text>
        </View>

        <TouchableOpacity onPress={handleCall}>
          <View className="flex-row items-center mb-3">
            <Feather name="phone" size={16} color="#666" />
            <Text className={`text-sm ml-2 ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
              {additionalInfo.phone}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center mb-3">
          <Feather name="globe" size={16} color="#666" />
          <Text className="text-sm ml-2 text-blue-500">{additionalInfo.website}</Text>
        </View>

        <View className="mt-4">
          <Text className={`font-semibold mb-2 ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
            Comodidades
          </Text>
          <View className="flex-row flex-wrap gap-2 mt-2">
            {additionalInfo.amenities.map((amenity, index) => (
              <View key={index} className="flex-row items-center w-1/2 mb-1">
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
                <Text className={`text-xs ml-2 ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
                  {amenity}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Rules */}
      <View className={`${isDark ? 'bg-card-dark' : 'bg-card'} rounded-xl p-4 mx-2 my-2 shadow-sm`}>
        <View className="mb-3">
          <Text className={`text-lg font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
            Reglas del gimnasio
          </Text>
        </View>
        <View className="gap-2">
          {gymRules.map((rule, index) => (
            <View key={index} className="flex-row items-start">
              <View className={`w-1.5 h-1.5 ${isDark ? 'bg-primary-dark' : 'bg-primary'} rounded-full mr-2 mt-2`} />
              <Text className={`text-sm flex-1 ml-2 ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
                {rule}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Check-in Alert */}
      {!isInRange && (
        <View className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mx-2 my-2 flex-row items-start">
          <Feather name="alert-triangle" size={16} color="#856404" />
          <Text className="text-sm text-yellow-800 ml-2 flex-1">
            Estás a {(gym.distance * 1000).toFixed(0)}m del gimnasio. Necesitás estar
            dentro de los 150m para hacer check-in.
          </Text>
        </View>
      )}

      {/* Check-in Button */}
      <TouchableOpacity 
        className={`${!isInRange ? 'bg-gray-400' : isDark ? 'bg-primary-dark' : 'bg-primary'} rounded-lg p-4 mx-4 my-2 items-center`}
        disabled={!isInRange} 
        onPress={onCheckIn}
      >
        <Text className={`text-base font-semibold ${!isInRange ? 'text-gray-600' : 'text-white'}`}>
          {isInRange
            ? 'Hacer Check-in'
            : `Acercate ${(gym.distance * 1000 - 150).toFixed(0)}m más`}
        </Text>
      </TouchableOpacity>

      <Text className={`text-xs text-center mx-4 my-2 ${isDark ? 'text-textMuted-dark' : 'text-textMuted'}`}>
        Al hacer check-in ganarás +10 tokens y extenderás tu racha
      </Text>

      {/* Recent Activity */}
      <View className={`${isDark ? 'bg-card-dark' : 'bg-card'} rounded-xl p-4 mx-2 my-2 shadow-sm`}>
        <View className="mb-3">
          <Text className={`text-lg font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
            Actividad reciente
          </Text>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 bg-blue-500 rounded-full justify-center items-center mr-3">
            <Text className="text-white text-xs font-bold">MG</Text>
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
              María G.
            </Text>
            <Text className={`text-xs ${isDark ? 'text-textMuted-dark' : 'text-textMuted'}`}>
              Hizo check-in hace 2 horas
            </Text>
          </View>
          <View className={`${isDark ? 'bg-muted-dark' : 'bg-muted'} rounded-2xl px-3 py-1`}>
            <Text className={`text-xs font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
              Racha 12 días
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 bg-green-500 rounded-full justify-center items-center mr-3">
            <Text className="text-white text-xs font-bold">JL</Text>
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
              Juan L.
            </Text>
            <Text className={`text-xs ${isDark ? 'text-textMuted-dark' : 'text-textMuted'}`}>
              Hizo check-in hace 4 horas
            </Text>
          </View>
          <View className={`${isDark ? 'bg-muted-dark' : 'bg-muted'} rounded-2xl px-3 py-1`}>
            <Text className={`text-xs font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
              Racha 5 días
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 bg-purple-500 rounded-full justify-center items-center mr-3">
            <Text className="text-white text-xs font-bold">AS</Text>
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
              Ana S.
            </Text>
            <Text className={`text-xs ${isDark ? 'text-textMuted-dark' : 'text-textMuted'}`}>
              Hizo check-in ayer
            </Text>
          </View>
          <View className={`${isDark ? 'bg-muted-dark' : 'bg-muted'} rounded-2xl px-3 py-1`}>
            <Text className={`text-xs font-semibold ${isDark ? 'text-textPrimary-dark' : 'text-textPrimary'}`}>
              Racha 21 días
            </Text>
          </View>
        </View>
      </View>

      <View className="h-8" />
    </Screen>
  );
}
