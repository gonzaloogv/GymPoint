import React, { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface DeleteAccountModalProps {
  visible: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteAccountModal({
  visible,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteAccountModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleCancel}
        className="flex-1 bg-black/50 justify-center items-center"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className={`mx-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          style={{ width: '90%', maxWidth: 400 }}
        >
          {/* Header con icono de advertencia */}
          <View className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className="flex-row items-center gap-3">
              <View className="bg-red-500/10 p-2 rounded-full">
                <Ionicons name="warning" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Eliminar cuenta
                </Text>
                <Text className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Esta acción no se puede deshacer
                </Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            className="p-4"
            style={{ maxHeight: 450 }}
            showsVerticalScrollIndicator={true}
          >
            {/* Advertencias */}
            <View className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
              <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                ¿Estás seguro que deseas eliminar tu cuenta?
              </Text>
              <Text className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                Esta acción programará tu cuenta para ser eliminada permanentemente.
              </Text>
            </View>

            {/* Lista de consecuencias */}
            <View className="mb-4">
              <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Se eliminarán permanentemente:
              </Text>
              {[
                'Tu perfil y todos tus datos personales',
                'Historial de entrenamientos y progreso',
                'Logros y recompensas obtenidas',
                'Tokens acumulados',
                'Rutinas guardadas',
              ].map((item, index) => (
                <View key={index} className="flex-row items-start gap-2 mb-2">
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color="#EF4444"
                    style={{ marginTop: 2 }}
                  />
                  <Text className={`text-sm flex-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            {/* Período de gracia */}
            <View className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={isDark ? '#60A5FA' : '#3B82F6'}
                />
                <Text className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  Período de gracia: 7 días
                </Text>
              </View>
              <Text className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                Tienes 7 días para cambiar de opinión y cancelar la eliminación desde tu perfil.
              </Text>
            </View>

            {/* Campo de razón (opcional) */}
            <View className="mb-2">
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Razón (opcional)
              </Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="¿Por qué deseas eliminar tu cuenta?"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                numberOfLines={3}
                maxLength={200}
                editable={!loading}
                className={`p-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                style={{ textAlignVertical: 'top' }}
              />
              <Text className={`text-xs mt-1 text-right ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {reason.length}/200
              </Text>
            </View>
          </ScrollView>

          {/* Footer con botones */}
          <View className={`p-4 border-t gap-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Botón Cancelar */}
            <Pressable
              onPress={handleCancel}
              disabled={loading}
              className={`py-3 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              } ${loading ? 'opacity-50' : ''}`}
            >
              <Text className={`text-center font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cancelar
              </Text>
            </Pressable>

            {/* Botón Confirmar eliminación */}
            <Pressable
              onPress={handleConfirm}
              disabled={loading}
              className={`py-3 rounded-lg ${loading ? 'opacity-50' : ''}`}
              style={{ backgroundColor: '#EF4444' }}
            >
              <View className="flex-row items-center justify-center gap-2">
                {loading ? (
                  <Ionicons name="hourglass-outline" size={16} color="white" />
                ) : (
                  <Ionicons name="trash-outline" size={16} color="white" />
                )}
                <Text className="text-center font-bold text-white">
                  {loading ? 'Procesando...' : 'Sí, eliminar mi cuenta'}
                </Text>
              </View>
            </Pressable>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
