import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { useCheckIn, useTodayCheckInStatus } from '@features/assistance';
import { UseGymSubscriptionStatusResult } from '@features/subscriptions';
import { useAchievementsStore } from '@features/progress/presentation/state/achievements.store';

interface CheckInSectionProps {
  gymId: number;
  gymName: string;
  distance: number;
  subscriptionStatus: UseGymSubscriptionStatusResult;
  onCheckIn?: () => void;
}

export function CheckInSection({
  gymId,
  gymName,
  distance,
  subscriptionStatus,
  onCheckIn,
}: CheckInSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { checkIn, isCheckingIn, error: checkInError } = useCheckIn();
  const todayCheckInStatus = useTodayCheckInStatus();
  const { syncAchievements } = useAchievementsStore();

  const isInRange = distance <= 0.15;

  const handleCheckIn = async () => {
    console.log('🎯 [CheckInSection] Botón de check-in presionado');

    const success = await checkIn(gymId);

    if (success) {
      // Refrescar el estado de check-in
      await todayCheckInStatus.refetch();

      // Sincronizar achievements (asistencia, streak, frecuencia)
      console.log('🏆 [CheckInSection] Sincronizando achievements después del check-in...');
      try {
        await syncAchievements();
        console.log('✅ [CheckInSection] Achievements sincronizados correctamente');
      } catch (error) {
        console.error('❌ [CheckInSection] Error sincronizando achievements:', error);
      }

      Alert.alert(
        '✅ Check-in exitoso',
        `Has registrado tu entrada a ${gymName}.\n\n¡Que tengas un excelente entrenamiento!`,
        [
          {
            text: 'Entendido',
            onPress: () => {
              if (onCheckIn) onCheckIn();
            },
          },
        ]
      );
    } else if (checkInError) {
      Alert.alert('❌ Error en check-in', checkInError, [{ text: 'Entendido' }]);
    }
  };

  return (
    <>
      {/* Distance Alert */}
      {!isInRange && (
        <View className="bg-yellow-100 border border-yellow-300 rounded-[24px] px-4 py-4 mx-4 mt-4 flex-row items-start">
          <Feather name="alert-triangle" size={16} color="#856404" />
          <Text className="text-sm text-yellow-800 ml-2 flex-1">
            Estás a {(distance * 1000).toFixed(0)}m del gimnasio. Necesitás estar dentro de los 150m para hacer
            check-in.
          </Text>
        </View>
      )}

      {/* Subscription Required Alert */}
      {isInRange && !subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial && (
        <View className="bg-red-100 border border-red-300 rounded-[24px] px-4 py-4 mx-4 mt-4 flex-row items-start">
          <Feather name="alert-circle" size={16} color="#dc2626" />
          <Text className="text-sm text-red-800 ml-2 flex-1">
            {subscriptionStatus.trialUsed
              ? 'Ya utilizaste tu visita de prueba. Necesitás una suscripción activa para hacer check-in.'
              : 'Necesitás una suscripción activa para hacer check-in en este gimnasio.'}
          </Text>
        </View>
      )}

      {/* Trial Available Alert */}
      {isInRange && !subscriptionStatus.hasActiveSubscription && subscriptionStatus.canUseTrial && (
        <View className="bg-blue-100 border border-blue-300 rounded-[24px] px-4 py-4 mx-4 mt-4 flex-row items-start">
          <Feather name="info" size={16} color="#2563eb" />
          <Text className="text-sm text-blue-800 ml-2 flex-1">
            Podés hacer check-in con tu visita de prueba. Se marcará como usada automáticamente.
          </Text>
        </View>
      )}

      {/* Check-in Already Done or Button */}
      {todayCheckInStatus.hasCheckedIn ? (
        <>
          <View className={`${isDark ? 'bg-green-900/30' : 'bg-green-50'} rounded-[24px] px-5 py-[18px] mx-4 mt-4`}>
            <View className="flex-row items-center mb-3">
              <View
                className={`w-14 h-14 ${
                  isDark ? 'bg-green-500/30' : 'bg-green-500/20'
                } rounded-full items-center justify-center mr-3`}
              >
                <Ionicons name="checkmark-circle" size={32} color={isDark ? '#4ade80' : '#22c55e'} />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-900'}`}>
                  Check-in registrado
                </Text>
                <Text className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  Ya registraste tu asistencia hoy
                </Text>
              </View>
            </View>
            {todayCheckInStatus.assistanceDetails && (
              <>
                {/* Gimnasio */}
                {todayCheckInStatus.assistanceDetails.gym_name && (
                  <View className={`${isDark ? 'bg-surface-dark/60' : 'bg-white/70'} rounded-[16px] p-3 mb-2`}>
                    <Text className={`text-xs font-medium mb-1 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                      Gimnasio
                    </Text>
                    <Text className={`text-sm font-bold ${isDark ? 'text-green-200' : 'text-green-900'}`}>
                      {todayCheckInStatus.assistanceDetails.gym_name}
                    </Text>
                  </View>
                )}
                {/* Hora de entrada */}
                <View className={`${isDark ? 'bg-surface-dark/60' : 'bg-white/70'} rounded-[16px] p-3`}>
                  <Text className={`text-xs font-medium mb-1 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                    Hora de entrada
                  </Text>
                  <Text className={`text-sm font-bold ${isDark ? 'text-green-200' : 'text-green-900'}`}>
                    {todayCheckInStatus.assistanceDetails.check_in_time.substring(0, 5)}
                  </Text>
                </View>
              </>
            )}
          </View>
          <Text className="text-xs text-center mx-4 mt-2 mb-8" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            ¡Que tengas un excelente entrenamiento!
          </Text>
        </>
      ) : (
        <>
          {/* Check-in Button */}
          <TouchableOpacity
            className={`${
              !isInRange ||
              (!subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial) ||
              isCheckingIn
                ? 'bg-gray-400'
                : 'bg-primary'
            } rounded-[24px] px-4 py-4 mx-4 mt-4 items-center`}
            disabled={
              !isInRange || (!subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial) || isCheckingIn
            }
            onPress={handleCheckIn}
          >
            {isCheckingIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  !isInRange || (!subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial)
                    ? 'text-gray-600'
                    : 'text-onPrimary'
                }`}
              >
                {!isInRange
                  ? `Acercate ${(distance * 1000 - 150).toFixed(0)}m más`
                  : !subscriptionStatus.hasActiveSubscription && !subscriptionStatus.canUseTrial
                  ? 'Suscribite para hacer check-in'
                  : subscriptionStatus.canUseTrial
                  ? 'Hacer Check-in (Visita de prueba)'
                  : 'Hacer Check-in'}
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-xs text-center mx-4 mt-2 mb-8" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            {(subscriptionStatus.hasActiveSubscription || subscriptionStatus.canUseTrial) &&
              'Al hacer check-in ganarás +10 tokens y extenderás tu racha'}
          </Text>
        </>
      )}
    </>
  );
}
