import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { FrequencySlider } from '@features/auth/presentation/ui/components/FrequencySlider';

interface FrequencySettingsProps {
  currentGoal: number;
  pendingGoal: number | null;
  onUpdate: (goal: number) => Promise<void>;
  loading?: boolean;
}

export const FrequencySettings: React.FC<FrequencySettingsProps> = ({
  currentGoal,
  pendingGoal,
  onUpdate,
  loading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const warningColor = '#F59E0B'; // Amber color for info message
  const primaryColor = '#4F9CF9';
  const successColor = '#10B981'; // Green color for success

  const displayedGoal = pendingGoal ?? currentGoal;
  const hasPendingChange = pendingGoal !== null && pendingGoal !== currentGoal;

  // Estado local para el valor temporal del slider
  const [localGoal, setLocalGoal] = useState(displayedGoal);
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasLocalChanges = localGoal !== displayedGoal;

  // Sincronizar estado local cuando cambie el valor del servidor
  useEffect(() => {
    setLocalGoal(displayedGoal);
  }, [displayedGoal]);

  const handleApply = async () => {
    if (hasLocalChanges && !isApplying) {
      console.log(`[FrequencySettings] Applying change: ${localGoal} (current: ${displayedGoal})`);
      setIsApplying(true);
      try {
        await onUpdate(localGoal);
        console.log('[FrequencySettings] Change applied successfully');
        // Mostrar mensaje de éxito
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error('[FrequencySettings] Error applying change:', error);
        Alert.alert(
          'Error',
          'No se pudo actualizar la frecuencia. Por favor, intenta nuevamente.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsApplying(false);
      }
    }
  };

  return (
    <View className="mb-6">
      {/* Título de la sección */}
      <View className="flex-row items-center gap-1.5 mb-3">
        <Ionicons name="calendar-outline" size={16} color={textColor} />
        <Text className="font-semibold text-base" style={{ color: textColor }}>
          Frecuencia Semanal
        </Text>
      </View>

      {/* Descripción */}
      <Text className="text-sm mb-4" style={{ color: subtextColor }}>
        Meta de días de entrenamiento por semana
      </Text>

      {/* Slider */}
      <FrequencySlider
        value={localGoal}
        onChange={setLocalGoal}
      />

      {/* Botón Aplicar - Solo se muestra si hay cambios locales */}
      {hasLocalChanges && (
        <TouchableOpacity
          onPress={handleApply}
          disabled={isApplying}
          className="mt-4 py-3 rounded-xl items-center flex-row justify-center gap-2"
          style={{ backgroundColor: isApplying ? subtextColor : primaryColor, opacity: isApplying ? 0.7 : 1 }}
          activeOpacity={0.8}
        >
          {isApplying ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-semibold text-base">
                Aplicando...
              </Text>
            </>
          ) : (
            <Text className="text-white font-semibold text-base">
              Aplicar cambio
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Mensaje de éxito */}
      {showSuccess && (
        <View className="mt-4 flex-row items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#064E3B' : '#D1FAE5' }}>
          <Ionicons name="checkmark-circle" size={20} color={successColor} />
          <Text className="text-sm font-medium flex-1" style={{ color: successColor }}>
            Cambio aplicado. Se activará el próximo lunes a las 00:05
          </Text>
        </View>
      )}

      {/* Mensaje informativo sobre cambio pendiente */}
      {hasPendingChange && !hasLocalChanges && !showSuccess && (
        <View className="mt-4 flex-row items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }}>
          <Ionicons name="information-circle-outline" size={20} color={warningColor} />
          <View className="flex-1">
            <Text className="text-sm font-medium" style={{ color: warningColor }}>
              Cambio programado
            </Text>
            <Text className="text-xs mt-1" style={{ color: subtextColor }}>
              Tu nueva meta de {pendingGoal} {pendingGoal === 1 ? 'día' : 'días'} por semana se aplicará el próximo lunes al iniciar la nueva semana.
            </Text>
            <Text className="text-xs mt-1" style={{ color: subtextColor }}>
              Meta actual: {currentGoal} {currentGoal === 1 ? 'día' : 'días'}
            </Text>
          </View>
        </View>
      )}

      {/* Mensaje informativo sobre cuándo se aplican los cambios */}
      {!hasPendingChange && !hasLocalChanges && !showSuccess && (
        <View className="mt-3 flex-row items-start gap-2 p-2">
          <Ionicons name="information-circle-outline" size={16} color={subtextColor} />
          <Text className="text-xs flex-1" style={{ color: subtextColor }}>
            Los cambios en tu meta semanal se aplicarán el próximo lunes a las 00:05
          </Text>
        </View>
      )}
    </View>
  );
};
