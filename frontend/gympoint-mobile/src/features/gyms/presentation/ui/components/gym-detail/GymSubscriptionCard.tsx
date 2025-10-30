import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Card } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { SubscriptionStatus } from '@features/subscriptions';

interface GymSubscriptionCardProps {
  gymId: number;
  gymName: string;
  subscriptionStatus: SubscriptionStatus;
}

export function GymSubscriptionCard({ gymId, gymName, subscriptionStatus }: GymSubscriptionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showManualSubscribeModal, setShowManualSubscribeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'MENSUAL' | 'SEMANAL' | 'ANUAL'>('MENSUAL');
  const [expirationDate, setExpirationDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleManualSubscribe = async () => {
    setShowManualSubscribeModal(false);

    // Convertir Date a formato ISO YYYY-MM-DD para el backend
    const subscriptionEnd = expirationDate.toISOString().split('T')[0];

    const success = await subscriptionStatus.subscribe(selectedPlan, {
      subscription_end: subscriptionEnd,
    });

    if (success) {
      await subscriptionStatus.refetch();
      Alert.alert(
        '✅ Suscripción registrada',
        `Te has suscrito exitosamente a ${gymName}.\n\n¡Ya podés hacer check-in!`,
        [{ text: 'Entendido' }]
      );
    }
  };

  return (
    <>
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
            {/* Active Member Badge */}
            <View className={`rounded-xl p-5 mb-4 ${isDark ? 'bg-surface-dark' : 'bg-white'} ${subscriptionStatus.subscription.isExpiringSoon ? 'border-2 border-yellow-500/50' : ''}`}>
              <View className="flex-row items-center mb-3">
                <View className={`w-14 h-14 rounded-full items-center justify-center mr-3 ${subscriptionStatus.subscription.isExpiringSoon ? 'bg-yellow-500/20' : isDark ? 'bg-green-500/30' : 'bg-green-500/20'}`}>
                  {subscriptionStatus.subscription.isExpiringSoon ? (
                    <Ionicons name="alert-circle" size={32} color="#eab308" />
                  ) : (
                    <Ionicons name="shield-checkmark" size={32} color={isDark ? '#4ade80' : '#22c55e'} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`text-xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                    Eres socio activo
                  </Text>
                  <View className={`self-start mt-1 rounded-full px-3 py-1 ${subscriptionStatus.subscription.isExpiringSoon ? 'bg-yellow-500/20' : isDark ? 'bg-green-500/30' : 'bg-green-500/20'}`}>
                    <Text className={`text-xs font-bold ${subscriptionStatus.subscription.isExpiringSoon ? isDark ? 'text-yellow-400' : 'text-yellow-800' : isDark ? 'text-green-400' : 'text-green-800'}`}>
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
                  `¿Estás seguro que deseas cancelar tu suscripción a ${gymName}?\n\nPerderás el acceso inmediatamente.`,
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
            {/* Trial Status Info */}
            {subscriptionStatus.canUseTrial ? (
              <TouchableOpacity
                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3 flex-row items-start"
                onPress={() => {
                  Alert.alert(
                    '🎁 Pase gratis por 1 día',
                    `${gymName} permite 1 día de pase gratis.\n\nPodrás hacer check-in una vez sin suscripción para probar el gimnasio.`,
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
            ) : subscriptionStatus.trialUsed ? (
              <View className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 mb-3 flex-row items-start">
                <Text style={{ fontSize: 20, marginRight: 12 }}>✓</Text>
                <View className="flex-1">
                  <Text className={`font-semibold mb-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                    Pase gratis usado
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
                    Ya utilizaste tu visita de prueba en este gimnasio
                  </Text>
                </View>
              </View>
            ) : (
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
            )}

            {/* Subscribe Button */}
            <TouchableOpacity
              className="bg-primary rounded-lg p-4 items-center"
              onPress={() => setShowManualSubscribeModal(true)}
              disabled={subscriptionStatus.isProcessing}
            >
              {subscriptionStatus.isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-onPrimary font-semibold">Suscribirme ahora</Text>
              )}
            </TouchableOpacity>
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
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className={`${isDark ? 'bg-background-dark' : 'bg-background'} rounded-t-3xl p-6`}>
            <Text className={`text-2xl font-bold mb-6 ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Suscribirse a {gymName}
            </Text>

            <Text className={`text-sm mb-3 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
              Seleccioná tu plan:
            </Text>
            <View className="flex-row gap-2 mb-6">
              {(['SEMANAL', 'MENSUAL', 'ANUAL'] as const).map((plan) => (
                <TouchableOpacity
                  key={plan}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                    selectedPlan === plan
                      ? 'bg-primary border-primary'
                      : isDark
                      ? 'bg-surface-dark border-border-dark'
                      : 'bg-white border-border'
                  }`}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <Text
                    className={`text-center font-semibold ${
                      selectedPlan === plan ? 'text-onPrimary' : isDark ? 'text-text-dark' : 'text-text'
                    }`}
                  >
                    {plan}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className={`text-sm mb-2 ${isDark ? 'text-textSecondary-dark' : 'text-textSecondary'}`}>
              Fecha de vencimiento:
            </Text>
            <TouchableOpacity
              className={`border rounded-xl p-4 mb-6 ${isDark ? 'border-border-dark bg-surface-dark' : 'border-border bg-white'}`}
              onPress={() => setShowDatePicker(true)}
            >
              <Text className={`text-base font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                {expirationDate.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={expirationDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setExpirationDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl ${isDark ? 'bg-surface-dark' : 'bg-gray-200'}`}
                onPress={() => setShowManualSubscribeModal(false)}
              >
                <Text className={`text-center font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary py-4 rounded-xl"
                onPress={handleManualSubscribe}
              >
                <Text className="text-onPrimary text-center font-semibold">Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
