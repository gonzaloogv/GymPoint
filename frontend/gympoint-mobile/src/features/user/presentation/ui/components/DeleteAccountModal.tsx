import React, { useState, useRef } from 'react';
import { Modal, ScrollView, TouchableOpacity, View, Text, TextInput, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { top } = useSafeAreaInsets();
  const [reason, setReason] = useState('');
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Arrastrar hacia abajo - comportamiento normal
          translateY.setValue(gestureState.dy);
        } else {
          // Arrastrar hacia arriba - con resistencia (efecto bounce)
          const resistance = 0.3;
          translateY.setValue(gestureState.dy * resistance);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          // Cerrar modal si se arrastró suficiente hacia abajo
          Animated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onCancel();
          });
        } else {
          // Volver a la posición original con bounce
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleModalShow = () => {
    // Reset translateY cuando la modal se muestra
    translateY.setValue(0);
  };

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel} onShow={handleModalShow}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <TouchableOpacity activeOpacity={1} onPress={handleCancel} className="flex-1" />

        <Animated.View
          className="rounded-t-[28px]"
          style={{
            transform: [{ translateY }],
            backgroundColor: isDark ? '#111827' : '#ffffff',
            maxHeight: '90%',
          }}
        >
          {/* Drag Indicator & Header */}
          <View {...panResponder.panHandlers} style={{ paddingTop: 22 }}>
            <View className="items-center pt-2 pb-3">
              <View
                className="w-12 h-[5px] rounded-full"
                style={{ backgroundColor: 'rgba(148, 163, 184, 0.35)' }}
              />
            </View>

            <View className="px-5 pb-4">
              <View className="flex-row items-center gap-3 mb-2">
                <View
                  className="w-14 h-14 rounded-[20px] border items-center justify-center"
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(248, 113, 113, 0.16)',
                    borderColor: isDark ? 'rgba(248, 113, 113, 0.38)' : 'rgba(248, 113, 113, 0.28)',
                  }}
                >
                  <Ionicons name="warning" size={22} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                  >
                    Eliminar cuenta
                  </Text>
                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    Esta acción no se puede deshacer
                  </Text>
                </View>
              </View>
              <View
                className="h-px rounded-full mt-3"
                style={{
                  backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)',
                }}
              />
            </View>
          </View>

          {/* Content */}
          <ScrollView
            className="px-5"
            style={{ maxHeight: 450 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={true}
          >
            {/* Advertencias */}
            <View
              className="px-4 py-3 rounded-2xl mb-4"
              style={{
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 226, 226, 0.8)',
              }}
            >
              <Text
                className="text-sm font-bold mb-2"
                style={{ color: isDark ? '#F87171' : '#DC2626' }}
              >
                ¿Estás seguro que deseas eliminar tu cuenta?
              </Text>
              <Text
                className="text-[13px] font-medium"
                style={{ color: isDark ? '#FCA5A5' : '#DC2626' }}
              >
                Esta acción programará tu cuenta para ser eliminada permanentemente.
              </Text>
            </View>

            {/* Lista de consecuencias */}
            <View className="mb-4">
              <Text
                className="text-sm font-bold mb-3"
                style={{ color: isDark ? '#E5E7EB' : '#374151' }}
              >
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
                  <Text
                    className="text-[13px] font-medium flex-1"
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            {/* Período de gracia */}
            <View
              className="px-4 py-3 rounded-2xl mb-4"
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(219, 234, 254, 0.8)',
              }}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={isDark ? '#60A5FA' : '#3B82F6'}
                />
                <Text
                  className="text-sm font-bold"
                  style={{ color: isDark ? '#60A5FA' : '#1D4ED8' }}
                >
                  Período de gracia: 7 días
                </Text>
              </View>
              <Text
                className="text-xs"
                style={{ color: isDark ? '#93C5FD' : '#1E40AF' }}
              >
                Tienes 7 días para cambiar de opinión y cancelar la eliminación desde tu perfil.
              </Text>
            </View>

            {/* Campo de razón (opcional) */}
            <View className="mb-2">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: isDark ? '#E5E7EB' : '#374151' }}
              >
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
                className="p-3 rounded-2xl border"
                style={{
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                  borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
                  color: isDark ? '#F9FAFB' : '#111827',
                  textAlignVertical: 'top',
                }}
              />
              <Text
                className="text-xs mt-1 text-right"
                style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}
              >
                {reason.length}/200
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={handleCancel}
                disabled={loading}
                activeOpacity={0.7}
                className="flex-1 py-3.5 rounded-2xl border items-center"
                style={{
                  backgroundColor: isDark ? 'rgba(75, 85, 99, 0.22)' : 'rgba(156, 163, 175, 0.16)',
                  borderColor: isDark ? 'rgba(75, 85, 99, 0.38)' : 'rgba(156, 163, 175, 0.28)',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isDark ? '#E5E7EB' : '#374151' }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={loading}
                activeOpacity={0.78}
                className="flex-1 py-3.5 rounded-2xl items-center"
                style={{
                  backgroundColor: '#EF4444',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <View className="flex-row items-center gap-2">
                  {loading ? (
                    <Ionicons name="hourglass-outline" size={16} color="white" />
                  ) : (
                    <Ionicons name="trash-outline" size={16} color="white" />
                  )}
                  <Text
                    className="text-sm font-bold text-white uppercase"
                    style={{ letterSpacing: 0.6 }}
                  >
                    {loading ? 'Procesando...' : 'Sí, eliminar'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
