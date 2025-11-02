import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { DeleteAccountModal } from './DeleteAccountModal';
import { CancelDeletionModal } from './CancelDeletionModal';

interface DeletionRequest {
  id_account: number;
  reason?: string;
  status: 'PENDING' | 'CANCELLED' | 'COMPLETED';
  scheduled_deletion_date?: string;
  requested_at: string;
  can_cancel: boolean;
}

interface DeleteAccountSectionProps {
  deletionRequest?: DeletionRequest | null;
  hasActiveRequest: boolean;
  onRequestDeletion: (reason?: string) => Promise<void>;
  onCancelDeletion: () => Promise<void>;
  loading?: boolean;
}

export function DeleteAccountSection({
  deletionRequest,
  hasActiveRequest,
  onRequestDeletion,
  onCancelDeletion,
  loading = false,
}: DeleteAccountSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleRequestDeletion = async (reason?: string) => {
    try {
      await onRequestDeletion(reason);
      setShowDeleteModal(false);
    } catch (error) {
      // Error será manejado por el hook
    }
  };

  const handleCancelDeletion = async () => {
    try {
      await onCancelDeletion();
      setShowCancelModal(false);
    } catch (error) {
      // Error será manejado por el hook
    }
  };

  return (
    <>
      <View className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-3">
          <View className={`p-2 rounded-full ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={isDark ? '#F87171' : '#EF4444'}
            />
          </View>
          <Text className={`text-base font-bold flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Zona de peligro
          </Text>
        </View>

        {/* Estado: Sin solicitud */}
        {!hasActiveRequest && (
          <View>
            <Text className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Eliminar tu cuenta es una acción permanente. Todos tus datos serán eliminados después del período de gracia.
            </Text>
            <Pressable
              onPress={() => setShowDeleteModal(true)}
              disabled={loading}
              className={`py-3 px-4 rounded-lg border-2 flex-row items-center justify-center gap-2 ${
                loading ? 'opacity-50' : ''
              }`}
              style={{
                borderColor: isDark ? '#EF4444' : '#F87171',
                backgroundColor: 'transparent'
              }}
            >
              <Ionicons name="trash-outline" size={16} color={isDark ? '#EF4444' : '#F87171'} />
              <Text
                className="font-semibold"
                style={{ color: isDark ? '#EF4444' : '#F87171' }}
              >
                Eliminar cuenta
              </Text>
            </Pressable>
          </View>
        )}

        {/* Estado: Solicitud pendiente */}
        {hasActiveRequest && deletionRequest && (
          <View>
            {/* Alert de solicitud pendiente */}
            <View className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons
                  name="time"
                  size={18}
                  color={isDark ? '#FBBF24' : '#F59E0B'}
                />
                <Text className={`text-sm font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  Eliminación programada
                </Text>
              </View>
              <Text className={`text-xs mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                Tu cuenta será eliminada el:{' '}
                {deletionRequest.scheduled_deletion_date ? (
                  <Text className="font-bold">
                    {new Date(deletionRequest.scheduled_deletion_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                ) : (
                  'Fecha pendiente'
                )}
              </Text>
              <Text className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                Puedes cancelar esta solicitud en cualquier momento antes de esa fecha.
              </Text>
            </View>

            {/* Razón (si existe) */}
            {deletionRequest.reason && (
              <View className="mb-3">
                <Text className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Razón:
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{deletionRequest.reason}"
                </Text>
              </View>
            )}

            {/* Botón para cancelar */}
            {deletionRequest.can_cancel && (
              <Pressable
                onPress={() => setShowCancelModal(true)}
                disabled={loading}
                className={`py-3 px-4 rounded-lg flex-row items-center justify-center gap-2 ${
                  loading ? 'opacity-50' : ''
                }`}
                style={{ backgroundColor: '#10B981' }}
              >
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text className="font-bold text-white">
                  Cancelar eliminación
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Modals */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onConfirm={handleRequestDeletion}
        onCancel={() => setShowDeleteModal(false)}
        loading={loading}
      />

      <CancelDeletionModal
        visible={showCancelModal}
        scheduledDate={deletionRequest?.scheduled_deletion_date}
        onConfirm={handleCancelDeletion}
        onCancel={() => setShowCancelModal(false)}
        loading={loading}
      />
    </>
  );
}
