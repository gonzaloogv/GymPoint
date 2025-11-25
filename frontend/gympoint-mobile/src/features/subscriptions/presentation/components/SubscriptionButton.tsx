import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { UseGymSubscriptionStatusResult } from '../hooks/useGymSubscriptionStatus';

interface SubscriptionButtonProps {
  gymName: string;
  status: UseGymSubscriptionStatusResult;
}

/**
 * Botón inteligente de suscripción que se adapta según el estado
 */
export function SubscriptionButton({ gymName, status }: SubscriptionButtonProps) {
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  const {
    hasActiveSubscription,
    canUseTrial,
    canSubscribe,
    reachedLimit,
    activeSubscriptionCount,
    subscription,
    trialAllowed,
    trialUsed,
    isProcessing,
    subscribe,
    unsubscribe,
  } = status;

  const handleSubscribe = () => {
    // Si alcanzó el límite y no tiene suscripción aquí
    if (reachedLimit && !hasActiveSubscription) {
      Alert.alert(
        'Límite alcanzado',
        `Ya tienes ${activeSubscriptionCount} gimnasios activos. Solo puedes tener hasta 2 gimnasios simultáneamente.\n\nCancela una suscripción para poder suscribirte a ${gymName}.`,
        [{ text: 'Entendido' }],
      );
      return;
    }

    // Mostrar selector de plan
    setShowPlanSelector(true);
  };

  const handleSelectPlan = async (plan: 'MENSUAL' | 'SEMANAL' | 'ANUAL') => {
    setShowPlanSelector(false);

    Alert.alert(
      'Confirmar suscripción',
      `¿Deseas suscribirte al plan ${plan.toLowerCase()} de ${gymName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            await subscribe(plan);
          },
        },
      ],
    );
  };

  const handleTrialVisit = () => {
    Alert.alert(
      'Visita de prueba',
      `${gymName} permite visitas de prueba.\n\nPodrás hacer check-in una vez sin suscripción. ¿Deseas continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Entendido',
          onPress: () => {
            // El trial se marca automáticamente cuando hace check-in
          },
        },
      ],
    );
  };

  const handleUnsubscribe = () => {
    Alert.alert(
      'Cancelar suscripción',
      `¿Estás seguro que deseas cancelar tu suscripción a ${gymName}?\n\nPerderás el acceso inmediatamente.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            await unsubscribe();
          },
        },
      ],
    );
  };

  // Botón de cancelar (si tiene suscripción activa)
  if (hasActiveSubscription && subscription) {
    const daysRemaining = subscription.daysRemaining;
    const isExpiring = subscription.isExpiringSoon;

    return (
      <View style={styles.container}>
        {/* Info de suscripción */}
        <View style={[styles.infoBox, isExpiring && styles.infoBoxWarning]}>
          <Text style={styles.infoTitle}>Suscripción activa</Text>
          <Text style={styles.infoText}>
            Plan {subscription.plan.toLowerCase()}
          </Text>
          <Text style={[styles.infoDays, isExpiring && styles.infoDaysWarning]}>
            {isExpiring ? '⚠️ ' : ''}
            {daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'}
          </Text>
        </View>

        {/* Botón de cancelar */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleUnsubscribe}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.cancelButtonText}>Cancelar suscripción</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Información de trial usado
  if (trialUsed) {
    return (
      <View style={styles.container}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Visita de prueba usada</Text>
          <Text style={styles.infoText}>
            Ya utilizaste tu visita de prueba en este gimnasio.
          </Text>
        </View>

        {canSubscribe && (
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.subscribeButtonText}>Suscribirme ahora</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Mostrar opciones de suscripción o trial
  return (
    <View style={styles.container}>
      {/* Info de trial si está disponible */}
      {canUseTrial && (
        <TouchableOpacity style={styles.trialInfo} onPress={handleTrialVisit}>
          <Text style={styles.trialIcon}>ℹ️</Text>
          <View style={styles.trialTextContainer}>
            <Text style={styles.trialTitle}>Visita de prueba disponible</Text>
            <Text style={styles.trialText}>
              Puedes hacer check-in una vez sin suscripción
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Botón de suscribirse */}
      {canSubscribe ? (
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.subscribeButtonText}>Suscribirme</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.limitBox}>
          <Text style={styles.limitText}>
            Ya tienes 2 gimnasios activos. Cancela una suscripción para poder suscribirte aquí.
          </Text>
        </View>
      )}

      {/* Modal selector de plan */}
      <Modal
        visible={showPlanSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlanSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un plan</Text>

            <ScrollView>
              {[
                { plan: 'SEMANAL', price: 'Semanal', emoji: '📅' },
                { plan: 'MENSUAL', price: 'Mensual', emoji: '📆' },
                { plan: 'ANUAL', price: 'Anual', emoji: '🗓️' },
              ].map(({ plan, price, emoji }) => (
                <TouchableOpacity
                  key={plan}
                  style={styles.planOption}
                  onPress={() => handleSelectPlan(plan as any)}
                >
                  <Text style={styles.planEmoji}>{emoji}</Text>
                  <Text style={styles.planName}>{price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowPlanSelector(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  infoBox: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  infoBoxWarning: {
    backgroundColor: '#fef3c7',
    borderLeftColor: '#f59e0b',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoDays: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  infoDaysWarning: {
    color: '#f59e0b',
  },
  subscribeButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  trialInfo: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  trialIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  trialTextContainer: {
    flex: 1,
  },
  trialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  trialText: {
    fontSize: 12,
    color: '#6b7280',
  },
  limitBox: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  limitText: {
    fontSize: 14,
    color: '#991b1b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  planEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalCancelButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
