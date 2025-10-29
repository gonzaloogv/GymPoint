import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SubscriptionWithStatus, SubscriptionUtils } from '../../domain/entities/Subscription';

interface SubscriptionCardProps {
  subscription: SubscriptionWithStatus;
  onPress?: () => void;
  onCancel?: () => void;
}

/**
 * Card component para mostrar información de una suscripción
 */
export function SubscriptionCard({ subscription, onPress, onCancel }: SubscriptionCardProps) {
  const { gym, plan, subscriptionEnd, status, daysRemaining, isExpiringSoon } = subscription;

  const statusColor = SubscriptionUtils.getStatusColor(status);
  const statusText = SubscriptionUtils.getStatusText(status);
  const planText = SubscriptionUtils.getPlanText(plan);

  const formattedEndDate = subscriptionEnd.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[styles.card, isExpiringSoon && styles.cardExpiring]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Imagen del gimnasio */}
      {gym?.profileImageUrl ? (
        <Image source={{ uri: gym.profileImageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>🏋️</Text>
        </View>
      )}

      {/* Contenido */}
      <View style={styles.content}>
        {/* Nombre del gimnasio */}
        <Text style={styles.gymName} numberOfLines={1}>
          {gym?.name || 'Gimnasio'}
        </Text>

        {/* Plan */}
        <Text style={styles.plan}>Plan {planText}</Text>

        {/* Estado y fecha */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>

          {status === 'ACTIVE' && (
            <Text style={styles.endDate}>
              Vence: {formattedEndDate}
            </Text>
          )}
        </View>

        {/* Días restantes (si está activa) */}
        {status === 'ACTIVE' && (
          <View style={styles.daysRow}>
            {isExpiringSoon ? (
              <Text style={styles.daysWarning}>
                ⚠️ {daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'}
              </Text>
            ) : (
              <Text style={styles.daysRemaining}>
                {daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'}
              </Text>
            )}
          </View>
        )}

        {/* Botón de cancelar (solo si está activa) */}
        {status === 'ACTIVE' && onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancelar suscripción</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardExpiring: {
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  plan: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  endDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  daysRow: {
    marginTop: 4,
  },
  daysRemaining: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  daysWarning: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
});
