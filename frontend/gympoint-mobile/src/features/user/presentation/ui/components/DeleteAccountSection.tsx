import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 26,
        elevation: 12,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 22,
        elevation: 6,
      };

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
      <View
        className="rounded-[28px] px-5 py-[18px] border"
        style={[
          {
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
          },
          shadowStyle,
        ]}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-4">
          <View
            className="w-14 h-14 rounded-[20px] border items-center justify-center"
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(248, 113, 113, 0.16)',
              borderColor: isDark ? 'rgba(248, 113, 113, 0.38)' : 'rgba(248, 113, 113, 0.28)',
            }}
          >
            <Ionicons
              name="warning-outline"
              size={22}
              color={isDark ? '#F87171' : '#EF4444'}
            />
          </View>
          <Text
            className="text-lg font-bold flex-1"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            Zona de peligro
          </Text>
        </View>

        {/* Estado: Sin solicitud */}
        {!hasActiveRequest && (
          <View>
            <Text
              className="text-[13px] font-medium leading-[18px] mb-4"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              Eliminar tu cuenta es una acción permanente. Todos tus datos serán eliminados después del período de gracia.
            </Text>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              disabled={loading}
              activeOpacity={0.78}
              className="py-3.5 rounded-2xl items-center border"
              style={{
                borderColor: isDark ? '#EF4444' : '#F87171',
                backgroundColor: 'transparent',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="trash-outline" size={16} color={isDark ? '#EF4444' : '#F87171'} />
                <Text
                  className="text-sm font-bold uppercase"
                  style={{ color: isDark ? '#EF4444' : '#F87171', letterSpacing: 0.6 }}
                >
                  Eliminar cuenta
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Estado: Solicitud pendiente */}
        {hasActiveRequest && deletionRequest && (
          <View>
            {/* Alert de solicitud pendiente */}
            <View
              className="px-4 py-3 rounded-2xl mb-4"
              style={{
                backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(254, 243, 199, 0.8)',
              }}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons
                  name="time"
                  size={18}
                  color={isDark ? '#FBBF24' : '#F59E0B'}
                />
                <Text
                  className="text-sm font-bold"
                  style={{ color: isDark ? '#FBBF24' : '#F59E0B' }}
                >
                  Eliminación programada
                </Text>
              </View>
              <Text
                className="text-xs mb-1"
                style={{ color: isDark ? '#FDE047' : '#D97706' }}
              >
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
              <Text
                className="text-xs"
                style={{ color: isDark ? '#FBBF24' : '#F59E0B' }}
              >
                Puedes cancelar esta solicitud en cualquier momento antes de esa fecha.
              </Text>
            </View>

            {/* Razón (si existe) */}
            {deletionRequest.reason && (
              <View className="mb-4">
                <Text
                  className="text-xs font-semibold mb-1.5 uppercase"
                  style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.6 }}
                >
                  Razón:
                </Text>
                <Text
                  className="text-[13px] font-medium"
                  style={{ color: isDark ? '#E5E7EB' : '#374151' }}
                >
                  "{deletionRequest.reason}"
                </Text>
              </View>
            )}

            {/* Botón para cancelar */}
            {deletionRequest.can_cancel && (
              <TouchableOpacity
                onPress={() => setShowCancelModal(true)}
                disabled={loading}
                activeOpacity={0.78}
                className="py-3.5 rounded-2xl items-center"
                style={{
                  backgroundColor: isDark ? '#059669' : '#10B981',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                  <Text
                    className="text-sm font-bold text-white uppercase"
                    style={{ letterSpacing: 0.6 }}
                  >
                    Cancelar eliminación
                  </Text>
                </View>
              </TouchableOpacity>
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
