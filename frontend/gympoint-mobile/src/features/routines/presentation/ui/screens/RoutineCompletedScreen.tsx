import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@shared/hooks';
import { Card, Button, ButtonText } from '@shared/components/ui';
import { CompletionStats } from '@features/routines/domain/entities/ExecutionSession';
import { formatDuration } from '@shared/utils';
import { useState } from 'react';
import { useSaveRoutineSession } from '@features/routines/presentation/hooks';

type RoutineCompletedScreenProps = {
  route: {
    params: CompletionStats;
  };
  navigation: any;
};

/**
 * Pantalla de finalización de rutina
 * Muestra resumen de la sesión, estadísticas y permite agregar notas
 */
export default function RoutineCompletedScreen({
  route,
  navigation,
}: RoutineCompletedScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Colores dinámicos
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#9ca3af' : '#6b7280';
  const backgroundColor = isDark ? '#111827' : '#f9fafb';
  const cardBgColor = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  // Estado local para notas
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Hook para guardar sesión
  const { saveSession } = useSaveRoutineSession();

  const stats = route?.params;
  if (!stats) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor }}>
        <Text style={{ color: textColor }}>Error: No hay datos de la sesión</Text>
      </View>
    );
  }

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      // Guardar la sesión con las notas
      await saveSession(stats, notes || undefined);
      setIsSaving(false);
      navigation.navigate('RoutinesList');
    } catch (error) {
      setIsSaving(false);
      Alert.alert(
        'Error',
        'No se pudo guardar la sesión. Por favor intenta de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          className="flex-1"
          style={{ backgroundColor }}
          contentContainerStyle={{
            paddingBottom: 32,
            paddingTop: 16,
          }}
        >
      {/* Trophy Icon + Title */}
      <View className="items-center py-8 gap-3">
        <Text className="text-6xl">🏆</Text>
        <Text
          className="text-3xl font-black text-center"
          style={{ color: textColor }}
        >
          ¡Entrenamiento Completado!
        </Text>
        <Text
          className="text-base text-center mt-2"
          style={{ color: secondaryTextColor }}
        >
          Eres una máquina, ¡sigue así!
        </Text>
      </View>

      {/* Contenido */}
      <View className="px-4 gap-4">
        {/* Card 1: Nombre de la rutina */}
        <Card>
          <View className="p-4">
            <Text
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: secondaryTextColor }}
            >
              Rutina completada
            </Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Text
                className="text-lg font-bold"
                style={{ color: '#3b82f6' }}
              >
                {stats.routineName}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Card 2: Streak Info */}
        <Card>
          <View className="p-4 flex-row items-center gap-3">
            <Text className="text-3xl">🔥</Text>
            <View className="flex-1">
              <Text
                className="text-base font-bold"
                style={{ color: textColor }}
              >
                Tu racha aumentó a {stats.streak || '1'} días
              </Text>
            </View>
          </View>
        </Card>

        {/* Card 3: Estadísticas */}
        <Card>
          <View className="p-4">
            <Text
              className="text-base font-bold mb-4"
              style={{ color: textColor }}
            >
              Estadísticas
            </Text>

            {/* Duración */}
            <View className="flex-row items-center justify-between py-2 border-b" style={{ borderBottomColor: borderColor }}>
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">⏱️</Text>
                <Text style={{ color: secondaryTextColor }}>Duración</Text>
              </View>
              <Text className="font-semibold" style={{ color: textColor }}>
                {formatDuration(stats.duration)}
              </Text>
            </View>

            {/* Volumen */}
            <View className="flex-row items-center justify-between py-2 border-b" style={{ borderBottomColor: borderColor }}>
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">💪</Text>
                <Text style={{ color: secondaryTextColor }}>Volumen total</Text>
              </View>
              <Text className="font-semibold" style={{ color: textColor }}>
                {stats.totalVolume.toFixed(0)} kg
              </Text>
            </View>

            {/* Series */}
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">📊</Text>
                <Text style={{ color: secondaryTextColor }}>Series completadas</Text>
              </View>
              <Text className="font-semibold" style={{ color: textColor }}>
                {stats.setsCompleted}/{stats.totalSets}
              </Text>
            </View>
          </View>
        </Card>

        {/* Card 4: Notas */}
        <Card>
          <View className="p-4">
            <Text
              className="text-base font-bold mb-3"
              style={{ color: textColor }}
            >
              Añadir nota (opcional)
            </Text>
            <TextInput
              className="border rounded-lg p-3 min-h-32"
              style={{
                borderColor: borderColor,
                backgroundColor: cardBgColor,
                color: textColor,
                textAlignVertical: 'top',
              }}
              placeholder="¿Cómo te sentiste? ¿Alguna observación?"
              placeholderTextColor={secondaryTextColor}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={500}
            />
            <Text
              className="text-xs mt-2"
              style={{ color: secondaryTextColor }}
            >
              {notes.length}/500
            </Text>
          </View>
        </Card>

        {/* Card 5: Tokens Earned */}
        {stats.tokensEarned && stats.tokensEarned > 0 && (
          <Card>
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-3xl">🪙</Text>
                <Text
                  className="font-semibold"
                  style={{ color: textColor }}
                >
                  Tokens ganados
                </Text>
              </View>
              <Text
                className="text-2xl font-black"
                style={{ color: '#f59e0b' }}
              >
                +{stats.tokensEarned}
              </Text>
            </View>
          </Card>
        )}

        {/* Button Terminar */}
        <Button
          onPress={handleFinish}
          className="w-full mt-4"
          disabled={isSaving}
        >
          {isSaving ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#ffffff" size="small" />
              <ButtonText>Guardando...</ButtonText>
            </View>
          ) : (
            <ButtonText>Terminar</ButtonText>
          )}
        </Button>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
