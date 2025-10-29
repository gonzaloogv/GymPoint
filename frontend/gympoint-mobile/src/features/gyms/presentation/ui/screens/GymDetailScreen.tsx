import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Pressable, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, Ionicons } from '@expo/vector-icons';
import { GymDetailScreenProps } from './GymDetailScreen.types';
import { useTheme } from '@shared/hooks';
import { Screen, Card } from '@shared/components/ui';
import { useGymDetail } from '../../hooks/useGymDetail';
import { ScheduleCard } from '../components';
import { useGymSubscriptionStatus } from '@features/subscriptions';
import { useCheckIn } from '@features/assistance';


export function GymDetailScreen({ gym, onBack, onCheckIn }: GymDetailScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showManualSubscribeModal, setShowManualSubscribeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'MENSUAL' | 'SEMANAL' | 'ANUAL'>('MENSUAL');
  const [expirationDate, setExpirationDate] = useState<Date>(() => {
    // Iniciar con fecha un mes adelante
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isInRange = gym.distance <= 0.15;

  // Fetch detailed gym data
  const { gym: gymDetail, schedules, loading, error, averageRating, totalReviews } = useGymDetail(gym.id);

  // Subscription status
  const subscriptionStatus = useGymSubscriptionStatus(
    gym.id,
    gym.name,
    gymDetail?.trial_allowed || false
  );

  // Check-in functionality
  const { checkIn, isCheckingIn, error: checkInError } = useCheckIn();

  // Use real data from API only
  const gymRules = gymDetail?.rules || [];

  const additionalInfo = {
    phone: gymDetail?.phone || '',
    website: gymDetail?.website || '',
    email: gymDetail?.email || '',
    amenities: gymDetail?.amenities || [],
  };

  const price = gymDetail?.monthPrice ?? gym.price ?? 0;

  // Map equipment from API (categorized object) to array for display
  const equipmentByCategory = gymDetail?.equipment || {};

  // Icon mapping for equipment categories
  const categoryIcons: Record<string, string> = {
    fuerza: '🏋️',
    cardio: '🏃',
    funcional: '🤸',
    pesas: '💪',
    maquinas: '⚙️',
  };

  const equipment = Object.entries(equipmentByCategory).map(([category, items]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    icon: categoryIcons[category.toLowerCase()] || '🏋️',
    items: items || [],
  }));

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

  // Format schedules for display
  const formatScheduleText = () => {
    if (!schedules || schedules.length === 0) {
      return 'Sin información de horarios';
    }

    // Map day number to day_of_week string
    const DAY_MAP: Record<number, string> = {
      0: 'dom',
      1: 'lun',
      2: 'mar',
      3: 'mie',
      4: 'jue',
      5: 'vie',
      6: 'sab',
    };

    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todayKey = DAY_MAP[today];
    const todaySchedule = schedules.find(s => s.day_of_week === todayKey);

    if (todaySchedule && !todaySchedule.closed && todaySchedule.opening_time && todaySchedule.closing_time) {
      return `${todaySchedule.opening_time.substring(0, 5)} - ${todaySchedule.closing_time.substring(0, 5)}`;
    }

    if (todaySchedule?.closed) {
      return 'Cerrado hoy';
    }

    return 'Sin información de horarios';
  };

  return (
    <Screen
      scroll={true}
      safeAreaTop={true}
      safeAreaBottom={false}
    >
      {/* Header with Back Button */}
      <View className="flex-row items-center px-4 pt-2 pb-2">
        <Pressable onPress={onBack} className="mr-2">
          <Ionicons name="chevron-back" size={28} color={isDark ? '#60A5FA' : '#3B82F6'} />
        </Pressable>
        <Text className={`flex-1 text-xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`} numberOfLines={1}>
          Detalles del Gimnasio
        </Text>
        {loading && (
          <ActivityIndicator size="small" color="#4A9CF5" />
        )}
      </View>

      {/* Hero Image */}
      <View className={`h-44 ${isDark ? 'bg-primary/20' : 'bg-primary/20'} rounded-2xl mx-4 mt-2 justify-center items-center`}>
        <View className="items-center">
          <View className={`w-16 h-16 ${isDark ? 'bg-primary/30' : 'bg-primary/30'} rounded-full justify-center items-center mb-2`}>
            <Text style={{ fontSize: 32 }}>🏋️</Text>
          </View>
          <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>Foto del gimnasio</Text>
        </View>
      </View>

      {/* Basic Info Card */}
      <Card className="mx-4 mt-4">
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
          {gym.name}
        </Text>

        {(averageRating !== null || totalReviews > 0) && (
          <View className="flex-row items-center mb-3">
            <Feather name="star" size={16} color="#FFD700" />
            <Text className={`font-semibold ml-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              {averageRating ? averageRating.toFixed(1) : 'N/A'}
            </Text>
            <Text className={`text-sm ml-1 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
              ({totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'})
            </Text>
          </View>
        )}

        <View className="flex-row items-center mb-2">
          <Feather name="map-pin" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
          <Text className={`text-sm ml-2 flex-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            {gym.address}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            • {gym.distance.toFixed(1)} km
          </Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Feather name="clock" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
          <Text className={`text-sm ml-2 flex-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            {formatScheduleText()}
          </Text>
          {schedules && schedules.length > 0 && (() => {
            const DAY_MAP: Record<number, string> = { 0: 'dom', 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie', 6: 'sab' };
            const today = new Date().getDay();
            const todayKey = DAY_MAP[today];
            const todaySchedule = schedules.find(s => s.day_of_week === todayKey);
            const isOpen = todaySchedule && !todaySchedule.closed;

            return isOpen ? (
              <View className="bg-green-500/20 border border-green-500/40 rounded-2xl px-3 py-1 ml-2">
                <Text className="text-xs font-semibold text-green-600">Abierto ahora</Text>
              </View>
            ) : (
              <View className="bg-red-500/20 border border-red-500/40 rounded-2xl px-3 py-1 ml-2">
                <Text className="text-xs font-semibold text-red-600">Cerrado</Text>
              </View>
            );
          })()}
        </View>

        <TouchableOpacity
          className={`${isDark ? 'border-border-dark' : 'border-border'} border rounded-lg px-4 py-3 flex-row items-center justify-center mt-2`}
          onPress={openInMaps}
        >
          <Feather name="external-link" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
          <Text className={`ml-2 font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Abrir en Maps
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Services Card */}
      {gymDetail?.services && gymDetail.services.length > 0 && (
        <Card className="mx-4 mt-4">
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Servicios disponibles
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {gymDetail.services.map((service, index) => (
              <View key={index} className={`${isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'} rounded-full px-4 py-2`}>
                <Text className={`text-sm ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {service}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Price Card */}
      <Card className="mx-4 mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-12 h-12 rounded-lg justify-center items-center mr-4 ${isDark ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
            <Feather name="dollar-sign" size={24} color={isDark ? '#60a5fa' : '#3b82f6'} />
          </View>
          <View>
            <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
              Precio mensual
            </Text>
            <Text className={`text-2xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
              ${price.toLocaleString('es-AR')}
            </Text>
          </View>
        </View>
        <View className="bg-green-500/20 border border-green-500/40 rounded-2xl px-3 py-1">
          <Text className="text-xs font-semibold text-green-600">Por mes</Text>
        </View>
      </Card>

      {/* Subscription Card */}
      <Card className="mx-4 mt-4">
        <View className="flex-row items-center mb-3">
          <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${isDark ? 'bg-purple-500/30' : 'bg-purple-100'}`}>
            <Feather name="credit-card" size={20} color={isDark ? '#c084fc' : '#9333ea'} />
          </View>
          <Text className={`text-lg font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Suscripción
          </Text>
        </View>

        {subscriptionStatus.isLoading ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color={isDark ? '#60a5fa' : '#3b82f6'} />
          </View>
        ) : subscriptionStatus.hasActiveSubscription && subscriptionStatus.subscription ? (
          <>
            {/* Active Member Badge - Destacado */}
            <View className={`rounded-xl p-5 mb-4 ${subscriptionStatus.subscription.isExpiringSoon ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/50' : 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/50'}`}>
              <View className="flex-row items-center mb-3">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${subscriptionStatus.subscription.isExpiringSoon ? 'bg-yellow-500/30' : 'bg-green-500/30'}`}>
                  <Text style={{ fontSize: 24 }}>
                    {subscriptionStatus.subscription.isExpiringSoon ? '⚠️' : '✅'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                    Eres socio activo
                  </Text>
                  <View className={`self-start mt-1 rounded-full px-3 py-1 ${subscriptionStatus.subscription.isExpiringSoon ? 'bg-yellow-500/30' : 'bg-green-500/30'}`}>
                    <Text className={`text-xs font-bold ${subscriptionStatus.subscription.isExpiringSoon ? 'text-yellow-800' : 'text-green-800'}`}>
                      {subscriptionStatus.subscription.plan}
                    </Text>
                  </View>
                </View>
              </View>

              <View className={`rounded-lg p-3 ${isDark ? 'bg-surface-dark/50' : 'bg-white/50'}`}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className={`text-sm font-medium ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                    Vencimiento
                  </Text>
                  <Text className={`text-sm font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                    {subscriptionStatus.subscription.subscriptionEnd.toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className={`text-sm font-medium ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                    Días restantes
                  </Text>
                  <Text className={`text-lg font-bold ${subscriptionStatus.subscription.isExpiringSoon ? 'text-yellow-700' : 'text-green-700'}`}>
                    {subscriptionStatus.subscription.daysRemaining}
                  </Text>
                </View>
              </View>

              {subscriptionStatus.subscription.isExpiringSoon && (
                <View className="mt-3 flex-row items-start">
                  <Text className="text-yellow-700 mr-2">⚠️</Text>
                  <Text className="text-xs text-yellow-700 flex-1">
                    Tu membresía está por vencer. Contactá al gimnasio para renovarla.
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              className="bg-red-500 rounded-lg p-3 items-center"
              onPress={() => {
                Alert.alert(
                  'Cancelar suscripción',
                  `¿Estás seguro que deseas cancelar tu suscripción a ${gym.name}?\n\nPerderás el acceso inmediatamente.`,
                  [
                    { text: 'No, conservar', style: 'cancel' },
                    {
                      text: 'Sí, cancelar',
                      style: 'destructive',
                      onPress: async () => {
                        const success = await subscriptionStatus.unsubscribe();
                        if (success) {
                          await subscriptionStatus.refetch();
                        }
                      }
                    }
                  ]
                );
              }}
              disabled={subscriptionStatus.isProcessing}
            >
              {subscriptionStatus.isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Cancelar suscripción</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Trial Info - Improved */}
            {gymDetail?.trial_allowed !== null && gymDetail?.trial_allowed !== undefined ? (
              gymDetail.trial_allowed && !subscriptionStatus.trialUsed ? (
                <TouchableOpacity
                  className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3 flex-row items-start"
                  onPress={() => {
                    Alert.alert(
                      '🎁 Pase gratis por 1 día',
                      `${gym.name} permite 1 día de pase gratis.\n\nPodrás hacer check-in una vez sin suscripción para probar el gimnasio.`,
                      [{ text: 'Entendido' }]
                    );
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>🎁</Text>
                  <View className="flex-1">
                    <Text className={`font-semibold mb-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      Pase gratis por 1 día disponible
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                      Este gimnasio permite 1 visita de prueba sin suscripción
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : !gymDetail.trial_allowed ? (
                <View className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 mb-3 flex-row items-start">
                  <Text style={{ fontSize: 20, marginRight: 12 }}>ℹ️</Text>
                  <View className="flex-1">
                    <Text className={`font-semibold mb-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      Sin pase gratis
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                      Este gimnasio requiere suscripción para entrenar
                    </Text>
                  </View>
                </View>
              ) : null
            ) : (
              <View className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 mb-3 flex-row items-start">
                <Text style={{ fontSize: 20, marginRight: 12 }}>ℹ️</Text>
                <View className="flex-1">
                  <Text className={`font-semibold mb-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                    Sin pase gratis
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                    Este gimnasio no permite pase gratis por 1 día
                  </Text>
                </View>
              </View>
            )}

            {/* Trial Used */}
            {subscriptionStatus.trialUsed && !subscriptionStatus.hasActiveSubscription && (
              <View className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 mb-3">
                <Text className={`font-semibold mb-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  Visita de prueba usada
                </Text>
                <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                  Ya utilizaste tu visita de prueba en este gimnasio.
                </Text>
              </View>
            )}

            {/* Subscribe Button or Limit Message */}
            {subscriptionStatus.canSubscribe ? (
              <TouchableOpacity
                className="bg-primary rounded-lg p-3 items-center"
                onPress={() => {
                  Alert.alert(
                    'Selecciona un plan',
                    'Elige el plan de suscripción que prefieras:',
                    [
                      {
                        text: 'Semanal',
                        onPress: () => {
                          Alert.alert(
                            'Confirmar suscripción',
                            `¿Deseas suscribirte al plan semanal de ${gym.name}?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Confirmar', onPress: () => subscriptionStatus.subscribe('SEMANAL') }
                            ]
                          );
                        }
                      },
                      {
                        text: 'Mensual',
                        onPress: () => {
                          Alert.alert(
                            'Confirmar suscripción',
                            `¿Deseas suscribirte al plan mensual de ${gym.name}?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Confirmar', onPress: () => subscriptionStatus.subscribe('MENSUAL') }
                            ]
                          );
                        }
                      },
                      {
                        text: 'Anual',
                        onPress: () => {
                          Alert.alert(
                            'Confirmar suscripción',
                            `¿Deseas suscribirte al plan anual de ${gym.name}?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Confirmar', onPress: () => subscriptionStatus.subscribe('ANUAL') }
                            ]
                          );
                        }
                      },
                      { text: 'Cancelar', style: 'cancel' }
                    ]
                  );
                }}
                disabled={subscriptionStatus.isProcessing}
              >
                {subscriptionStatus.isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-onPrimary font-semibold">Suscribirme</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <Text className={`font-semibold mb-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  Límite alcanzado
                </Text>
                <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                  Ya tienes {subscriptionStatus.activeSubscriptionCount} gimnasios activos. Solo puedes tener hasta 2 gimnasios simultáneamente. Cancela una suscripción para continuar.
                </Text>
              </View>
            )}

            {/* Manual Association Section - "Ya eres socio?" */}
            {!subscriptionStatus.hasActiveSubscription && subscriptionStatus.canSubscribe && (
              <View className="mt-4 pt-4 border-t border-gray-300/20">
                <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  ¿Ya eres socio?
                </Text>
                <Text className={`text-xs mb-3 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                  Si ya pagaste en efectivo o por transferencia, asocia tu membresía aquí
                </Text>
                <TouchableOpacity
                  className="bg-purple-600 rounded-lg p-3 items-center flex-row justify-center"
                  onPress={() => setShowManualSubscribeModal(true)}
                  disabled={subscriptionStatus.isProcessing}
                >
                  <Feather name="user-check" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text className="text-white font-semibold">Asociarme al gimnasio</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </Card>

      {/* Manual Subscribe Modal */}
      <Modal
        visible={showManualSubscribeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualSubscribeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDark ? 'bg-surface-dark' : 'bg-white'} rounded-t-3xl p-6`}>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Asociar membresía
            </Text>

            {/* Plan Selector */}
            <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Tipo de plan
            </Text>
            <View className="flex-row gap-2 mb-4">
              {(['SEMANAL', 'MENSUAL', 'ANUAL'] as const).map((plan) => (
                <TouchableOpacity
                  key={plan}
                  className={`flex-1 p-3 rounded-lg border-2 ${
                    selectedPlan === plan
                      ? 'bg-purple-600 border-purple-600'
                      : isDark
                      ? 'bg-surfaceVariant-dark border-gray-600'
                      : 'bg-surfaceVariant border-gray-300'
                  }`}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <Text
                    className={`text-center font-semibold ${
                      selectedPlan === plan ? 'text-white' : isDark ? 'text-text-dark' : 'text-text'
                    }`}
                  >
                    {plan.charAt(0) + plan.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Expiration Date Picker */}
            <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              ¿Cuándo vence tu membresía?
            </Text>
            <TouchableOpacity
              className={`p-4 rounded-lg border mb-1 ${
                isDark
                  ? 'bg-surfaceVariant-dark border-gray-600'
                  : 'bg-surfaceVariant border-gray-300'
              }`}
              onPress={() => setShowDatePicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`text-base ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {expirationDate.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
                <Feather name="calendar" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              </View>
            </TouchableOpacity>
            <Text className={`text-xs mb-4 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
              Seleccioná la fecha en que vence tu membresía
            </Text>

            {/* Date Picker Modal */}
            {showDatePicker && (
              <DateTimePicker
                value={expirationDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setExpirationDate(selectedDate);
                  }
                }}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-surfaceVariant-dark' : 'bg-gray-200'}`}
                onPress={() => {
                  setShowManualSubscribeModal(false);
                  // Reset a un mes adelante
                  const resetDate = new Date();
                  resetDate.setMonth(resetDate.getMonth() + 1);
                  setExpirationDate(resetDate);
                }}
              >
                <Text className={`text-center font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-purple-600 p-3 rounded-lg"
                onPress={async () => {
                  // Validar que la fecha sea futura
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const selectedDay = new Date(expirationDate);
                  selectedDay.setHours(0, 0, 0, 0);

                  if (selectedDay <= today) {
                    Alert.alert('Error', 'La fecha de vencimiento debe ser futura');
                    return;
                  }

                  // Formato ISO para backend (YYYY-MM-DD)
                  const isoEndDate = expirationDate.toISOString().split('T')[0];
                  const isoStartDate = new Date().toISOString().split('T')[0];

                  setShowManualSubscribeModal(false);

                  // Suscribirse con fechas manuales
                  console.log('🚀 [GymDetailScreen] Iniciando suscripción manual:', { gymId: gym.id, plan: selectedPlan, start: isoStartDate, end: isoEndDate });

                  const success = await subscriptionStatus.subscribe(selectedPlan, {
                    subscription_start: isoStartDate,
                    subscription_end: isoEndDate,
                  });

                  console.log('🎯 [GymDetailScreen] Resultado de suscripción:', success);

                  if (success) {
                    console.log('🔄 [GymDetailScreen] Ejecutando refetch...');
                    // Refrescar el estado de suscripción
                    await subscriptionStatus.refetch();
                    console.log('✅ [GymDetailScreen] Refetch completado. Nuevo estado:', {
                      hasActiveSubscription: subscriptionStatus.hasActiveSubscription,
                      canUseTrial: subscriptionStatus.canUseTrial
                    });

                    // Reset a un mes adelante para próxima vez
                    const resetDate = new Date();
                    resetDate.setMonth(resetDate.getMonth() + 1);
                    setExpirationDate(resetDate);

                    Alert.alert(
                      '✅ ¡Asociación exitosa!',
                      `Ya eres socio activo de ${gym.name}.\n\nTu membresía vence el ${expirationDate.toLocaleDateString('es-AR')}.\n\n¡Ahora puedes hacer check-in!`,
                      [{ text: 'Entendido', onPress: () => {} }]
                    );
                  }
                }}
                disabled={subscriptionStatus.isProcessing}
              >
                {subscriptionStatus.isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-semibold">Asociarme</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Equipment Card */}
      {equipment.length > 0 && (
        <Card className="mx-4 mt-4">
          <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
            Maquinaria disponible
          </Text>
          {equipment.map((category, index) => {
          const isExpanded = expandedCategories.includes(category.category);
          const totalQuantity = getTotalQuantity(category.items);

          return (
            <View key={index} className="mb-2">
              <TouchableOpacity
                className={`${isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'} rounded-lg p-3 flex-row items-center justify-between`}
                onPress={() => toggleCategory(category.category)}
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${isDark ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
                    <Text style={{ fontSize: 20 }}>{category.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`text-base font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      {category.category}
                    </Text>
                  </View>
                  <View className={`${isDark ? 'bg-surface-dark' : 'bg-surface'} rounded-2xl px-3 py-1 mr-2`}>
                    <Text className={`text-xs font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      {totalQuantity}
                    </Text>
                  </View>
                  <Feather
                    name={isExpanded ? 'chevron-down' : 'chevron-right'}
                    size={16}
                    color={isDark ? '#B0B8C8' : '#666666'}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View className="ml-4 mt-2">
                  {category.items.map((item, itemIndex) => (
                    <View key={itemIndex} className={`flex-row items-center justify-between p-3 ${isDark ? 'bg-surfaceVariant-dark/50' : 'bg-surfaceVariant/50'} rounded-lg mb-1`}>
                      <View className="flex-row items-center">
                        <View className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        <Text className={`text-sm ${isDark ? 'text-text-dark' : 'text-text'}`}>
                          {item.name}
                        </Text>
                      </View>
                      <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                        {item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
        </Card>
      )}

      {/* Contact & Info Card */}
      <Card className="mx-4 mt-4">
        <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
          Información de contacto
        </Text>

        {additionalInfo.phone && (
          <TouchableOpacity onPress={handleCall}>
            <View className="flex-row items-center mb-3">
              <Feather name="phone" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
              <Text className={`text-sm ml-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                {additionalInfo.phone}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {additionalInfo.email && (
          <View className="flex-row items-center mb-3">
            <Feather name="mail" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
            <Text className={`text-sm ml-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              {additionalInfo.email}
            </Text>
          </View>
        )}

        {additionalInfo.website && (
          <View className="flex-row items-center mb-3">
            <Feather name="globe" size={16} color={isDark ? '#B0B8C8' : '#666666'} />
            <Text className="text-sm ml-2 text-blue-500">{additionalInfo.website}</Text>
          </View>
        )}

        {additionalInfo.amenities.length > 0 && (
          <View className="mt-2">
            <Text className={`font-semibold mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Comodidades
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {additionalInfo.amenities.map((amenity) => (
                <View
                  key={amenity.id_amenity}
                  className={`${isDark ? 'bg-surfaceVariant-dark' : 'bg-surfaceVariant'} rounded-full px-3 py-1.5`}
                >
                  <Text className={`text-xs ${isDark ? 'text-text-dark' : 'text-text'}`}>
                    {amenity.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* Schedule */}
      {schedules && schedules.length > 0 && (
        <View className="mx-4 mt-4">
          <ScheduleCard schedules={schedules} isDark={isDark} />
        </View>
      )}

      {/* Rules Card */}
      <Card className="mx-4 mt-4">
        <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-text-dark' : 'text-text'}`}>
          Reglas del gimnasio
        </Text>
        {gymRules.length > 0 ? (
          <View className="gap-2">
            {gymRules.map((rule, index) => (
              <View key={index} className="flex-row items-start">
                <View className="w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-2" />
                <Text className={`text-sm flex-1 ml-2 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {rule}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
            El gimnasio no tiene reglas registradas
          </Text>
        )}
      </Card>

      {/* Check-in Alert - Distance */}
      {!isInRange && (
        <View className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mx-4 mt-4 flex-row items-start">
          <Feather name="alert-triangle" size={16} color="#856404" />
          <Text className="text-sm text-yellow-800 ml-2 flex-1">
            Estás a {(gym.distance * 1000).toFixed(0)}m del gimnasio. Necesitás estar
            dentro de los 150m para hacer check-in.
          </Text>
        </View>
      )}

      {/* Check-in Alert - Subscription Required */}
      {isInRange && !subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial && (
        <View className="bg-red-100 border border-red-300 rounded-2xl p-4 mx-4 mt-4 flex-row items-start">
          <Feather name="alert-circle" size={16} color="#dc2626" />
          <Text className="text-sm text-red-800 ml-2 flex-1">
            {subscriptionStatus.trialUsed
              ? 'Ya utilizaste tu visita de prueba. Necesitás una suscripción activa para hacer check-in.'
              : 'Necesitás una suscripción activa para hacer check-in en este gimnasio.'}
          </Text>
        </View>
      )}

      {/* Check-in Alert - Trial Available */}
      {isInRange && !subscriptionStatus.hasActiveSubscription && subscriptionStatus.canUseTrial && (
        <View className="bg-blue-100 border border-blue-300 rounded-2xl p-4 mx-4 mt-4 flex-row items-start">
          <Feather name="info" size={16} color="#2563eb" />
          <Text className="text-sm text-blue-800 ml-2 flex-1">
            Podés hacer check-in con tu visita de prueba. Se marcará como usada automáticamente.
          </Text>
        </View>
      )}

      {/* Check-in Button */}
      <TouchableOpacity
        className={`${
          !isInRange || (!subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial) || isCheckingIn
            ? 'bg-gray-400'
            : 'bg-primary'
        } rounded-2xl p-4 mx-4 mt-4 items-center`}
        disabled={!isInRange || (!subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial) || isCheckingIn}
        onPress={async () => {
          console.log('🎯 [GymDetailScreen] Botón de check-in presionado');

          const success = await checkIn(gym.id);

          if (success) {
            Alert.alert(
              '✅ Check-in exitoso',
              `Has registrado tu entrada a ${gym.name}.\n\n¡Que tengas un excelente entrenamiento!`,
              [
                {
                  text: 'Entendido',
                  onPress: () => {
                    // Llamar al callback original si existe
                    if (onCheckIn) {
                      onCheckIn();
                    }
                  }
                }
              ]
            );
          } else if (checkInError) {
            Alert.alert(
              '❌ Error en check-in',
              checkInError,
              [{ text: 'Entendido' }]
            );
          }
        }}
      >
        {isCheckingIn ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className={`text-base font-semibold ${
            !isInRange || (!subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial)
              ? 'text-gray-600'
              : 'text-onPrimary'
          }`}>
            {!isInRange
              ? `Acercate ${(gym.distance * 1000 - 150).toFixed(0)}m más`
              : !subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial
              ? 'Suscribite para hacer check-in'
              : subscriptionStatus.canUseTrial
              ? 'Hacer Check-in (Visita de prueba)'
              : 'Hacer Check-in'}
          </Text>
        )}
      </TouchableOpacity>

      <Text className={`text-xs text-center mx-4 mt-2 mb-8 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
        {(subscriptionStatus.hasActiveSubscription || subscriptionStatus.canUseTrial) &&
          'Al hacer check-in ganarás +10 tokens y extenderás tu racha'}
      </Text>
    </Screen>
  );
}
