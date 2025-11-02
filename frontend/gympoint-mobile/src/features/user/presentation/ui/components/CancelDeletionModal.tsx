import React from 'react';
import { Modal, TouchableOpacity, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface CancelDeletionModalProps {
  visible: boolean;
  scheduledDate?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CancelDeletionModal({
  visible,
  scheduledDate,
  onConfirm,
  onCancel,
  loading = false,
}: CancelDeletionModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCancel}
        className="flex-1 bg-black/50 justify-center items-center"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className={`mx-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          style={{ width: '90%', maxWidth: 400 }}
        >
          {/* Header */}
          <View className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className="flex-row items-center gap-3">
              <View className="bg-green-500/10 p-2 rounded-full">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Cancelar eliminación
                </Text>
                <Text className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mantener tu cuenta activa
                </Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View className="p-4">
            <Text className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              ¿Deseas cancelar la solicitud de eliminación de tu cuenta?
            </Text>

            {scheduledDate && (
              <View className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={isDark ? '#FBBF24' : '#F59E0B'}
                  />
                  <Text className={`text-sm font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    Eliminación programada
                  </Text>
                </View>
                <Text className={`text-xs ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                  Fecha: {new Date(scheduledDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            )}

            <View className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <Text className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                Al cancelar, tu cuenta permanecerá activa y podrás seguir usando GymPoint normalmente.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View className={`p-4 border-t gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className={`py-3 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              } ${loading ? 'opacity-50' : ''}`}
            >
              <Text className={`text-center font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Volver
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className={`py-3 rounded-lg ${loading ? 'opacity-50' : ''}`}
              style={{ backgroundColor: '#10B981' }}
            >
              <View className="flex-row items-center justify-center gap-2">
                {loading ? (
                  <Ionicons name="hourglass-outline" size={16} color="white" />
                ) : (
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                )}
                <Text className="text-center font-bold text-white">
                  {loading ? 'Procesando...' : 'Sí, mantener mi cuenta'}
                </Text>
              </View>
            </Pressable>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
