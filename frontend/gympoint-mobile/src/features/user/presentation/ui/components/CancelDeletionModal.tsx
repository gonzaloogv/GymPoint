import React, { useRef } from 'react';
import { Modal, TouchableOpacity, View, Text, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { top } = useSafeAreaInsets();
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} onShow={handleModalShow}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <TouchableOpacity activeOpacity={1} onPress={onCancel} className="flex-1" />

        <Animated.View
          className="rounded-t-[28px]"
          style={{
            transform: [{ translateY }],
            backgroundColor: isDark ? '#111827' : '#ffffff',
            maxHeight: '85%',
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
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.16)',
                    borderColor: isDark ? 'rgba(52, 211, 153, 0.38)' : 'rgba(52, 211, 153, 0.28)',
                  }}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                  >
                    Cancelar eliminación
                  </Text>
                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    Mantener tu cuenta activa
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
          <View className="px-5 pb-6">
            <Text
              className="text-[13px] font-medium leading-[18px] mb-4"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              ¿Deseas cancelar la solicitud de eliminación de tu cuenta?
            </Text>

            {scheduledDate && (
              <View
                className="px-4 py-3 rounded-2xl mb-4"
                style={{
                  backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(254, 243, 199, 0.8)',
                }}
              >
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons
                    name="time-outline"
                    size={16}
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
                  className="text-xs"
                  style={{ color: isDark ? '#FDE047' : '#D97706' }}
                >
                  Fecha: {new Date(scheduledDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            )}

            <View
              className="px-4 py-3 rounded-2xl mb-6"
              style={{
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(209, 250, 229, 0.8)',
              }}
            >
              <Text
                className="text-[13px] font-medium"
                style={{ color: isDark ? '#6EE7B7' : '#047857' }}
              >
                Al cancelar, tu cuenta permanecerá activa y podrás seguir usando GymPoint normalmente.
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onCancel}
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
                  Volver
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                disabled={loading}
                activeOpacity={0.78}
                className="flex-1 py-3.5 rounded-2xl items-center"
                style={{
                  backgroundColor: isDark ? '#059669' : '#10B981',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <View className="flex-row items-center gap-2">
                  {loading ? (
                    <Ionicons name="hourglass-outline" size={16} color="white" />
                  ) : (
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                  )}
                  <Text
                    className="text-sm font-bold text-white uppercase"
                    style={{ letterSpacing: 0.6 }}
                  >
                    {loading ? 'Procesando...' : 'Mantener cuenta'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
