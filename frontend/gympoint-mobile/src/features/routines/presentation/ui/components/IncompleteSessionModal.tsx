import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type Props = {
  visible: boolean;
  routineName?: string;
  onContinue: () => void;
  onClose: () => void;
};

export function IncompleteSessionModal({
  visible,
  routineName = 'rutina',
  onContinue,
  onClose,
}: Props) {
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
            onClose();
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={handleModalShow}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1" />

        <Animated.View
          className="rounded-t-[28px]"
          style={{
            transform: [{ translateY }],
            backgroundColor: isDark ? '#111827' : '#ffffff',
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
                    backgroundColor: isDark ? 'rgba(251, 191, 36, 0.22)' : 'rgba(251, 191, 36, 0.16)',
                    borderColor: isDark ? 'rgba(251, 191, 36, 0.38)' : 'rgba(251, 191, 36, 0.28)',
                  }}
                >
                  <Ionicons name="time-outline" size={22} color={isDark ? '#FBBF24' : '#F59E0B'} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                  >
                    Sesión incompleta
                  </Text>
                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    Continúa donde lo dejaste
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
              className="text-[13px] font-medium leading-[18px] mb-6"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              Tienes una sesión incompleta de <Text className="font-bold">{routineName}</Text>. Continúa donde lo dejaste o cierra para iniciar otra.
            </Text>

            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={onContinue}
                activeOpacity={0.78}
                className="py-3.5 rounded-2xl items-center"
                style={{ backgroundColor: isDark ? '#4C51BF' : '#4338CA' }}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="play-circle" size={16} color="white" />
                  <Text
                    className="text-sm font-bold text-white uppercase"
                    style={{ letterSpacing: 0.6 }}
                  >
                    Continuar entrenamiento
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                className="py-3.5 rounded-2xl border items-center"
                style={{
                  backgroundColor: isDark ? 'rgba(75, 85, 99, 0.22)' : 'rgba(156, 163, 175, 0.16)',
                  borderColor: isDark ? 'rgba(75, 85, 99, 0.38)' : 'rgba(156, 163, 175, 0.28)',
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isDark ? '#E5E7EB' : '#374151' }}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
