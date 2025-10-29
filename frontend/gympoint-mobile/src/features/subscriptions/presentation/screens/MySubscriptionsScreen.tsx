import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useSubscriptionActions } from '../hooks/useSubscriptionActions';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { SubscriptionWithStatus } from '../../domain/entities/Subscription';

/**
 * Pantalla para ver y gestionar las suscripciones del usuario
 */
export function MySubscriptionsScreen({ navigation }: any) {
  const {
    subscriptions,
    activeCount,
    canSubscribeToMore,
    isLoading,
    error,
    refetch,
  } = useSubscriptions();

  const { unsubscribe, isUnsubscribing } = useSubscriptionActions();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCardPress = (subscription: SubscriptionWithStatus) => {
    if (subscription.gym) {
      navigation.navigate('GymDetail', { gymId: subscription.gymId });
    }
  };

  const handleCancelSubscription = (subscription: SubscriptionWithStatus) => {
    const gymName = subscription.gym?.name || 'este gimnasio';

    Alert.alert(
      'Cancelar suscripción',
      `¿Estás seguro que deseas cancelar tu suscripción a ${gymName}?\n\nPerderás el acceso inmediatamente.`,
      [
        {
          text: 'No, conservar',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            const success = await unsubscribe(subscription.gymId, gymName);
            if (success) {
              await refetch();
            }
          },
        },
      ],
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Mis Suscripciones</Text>

      {/* Contador de gimnasios */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {activeCount} / 2 gimnasios activos
        </Text>
        {!canSubscribeToMore && (
          <Text style={styles.limitWarning}>
            Has alcanzado el límite de gimnasios
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🏋️</Text>
      <Text style={styles.emptyTitle}>No tienes suscripciones</Text>
      <Text style={styles.emptyText}>
        Explora gimnasios cerca de ti y activa tu primera suscripción
      </Text>
    </View>
  );

  const renderSubscription = ({ item }: { item: SubscriptionWithStatus }) => (
    <SubscriptionCard
      subscription={item}
      onPress={() => handleCardPress(item)}
      onCancel={() => handleCancelSubscription(item)}
    />
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Cargando suscripciones...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Error al cargar</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={subscriptions}
        renderItem={renderSubscription}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
          />
        }
      />

      {/* Loading overlay cuando se está cancelando */}
      {isUnsubscribing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingOverlayText}>Cancelando...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  counterContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  limitWarning: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingOverlayText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});
