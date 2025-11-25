import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@shared/hooks';
import { SurfaceScreen, MetricTile, Button, ButtonText, Card } from '@shared/components/ui';
import { CompletionStats } from '@features/routines/domain/entities/ExecutionSession';
import { formatDuration } from '@shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { useSaveRoutineSession } from '@features/routines/presentation/hooks';

type RoutineCompletedScreenProps = {
  route: {
    params: CompletionStats;
  };
  navigation: any;
};

const RoutineCompletedScreen = ({ route, navigation }: RoutineCompletedScreenProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { saveSession } = useSaveRoutineSession();

  const stats = route?.params;

  if (!stats) {
    return (
      <SurfaceScreen>
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: isDark ? '#ffffff' : '#111827' }}>No hay datos de la sesion</Text>
        </View>
      </SurfaceScreen>
    );
  }

  const tokensEarned = stats.tokensEarned ?? 0;

  const handleFinish = async () => {
    try {
      setIsSaving(true);
      await saveSession(stats, notes || undefined);
      navigation.navigate('RoutinesList');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la sesion. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const headerAccent = isDark ? '#FACC15' : '#CA8A04';
  const cardBorder = isDark ? '#374151' : '#E5E7EB';
  const secondaryText = isDark ? '#9CA3AF' : '#6B7280';
  const primaryText = isDark ? '#F9FAFB' : '#111827';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SurfaceScreen
        scroll
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 36,
          rowGap: 24,
        }}
        scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
      >
        <View className="items-center gap-3">
          <Ionicons name="trophy" size={52} color={headerAccent} />
          <Text
            className="text-[28px] font-extrabold text-center"
            style={{ color: primaryText }}
          >
            Entrenamiento completado
          </Text>
          <Text className="text-sm text-center" style={{ color: secondaryText }}>
            Gran trabajo. Sigue asi!
          </Text>
        </View>

        <Card style={{ borderColor: cardBorder }}>
          <View className="p-4 gap-2">
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color: secondaryText, letterSpacing: 1 }}
            >
              Rutina
            </Text>
            <Text className="text-lg font-bold" style={{ color: '#4F46E5' }}>
              {stats.routineName || 'Rutina sin nombre'}
            </Text>
          </View>
        </Card>

        <View className="flex-row">
          <View className="flex-1">
            <MetricTile
              tone="primary"
              label="Duracion"
              value={formatDuration(stats.duration)}
              icon={<Ionicons name="time-outline" size={20} color="#6366F1" />}
              size="compact"
            />
          </View>
          <View className="flex-1 ml-3">
            <MetricTile
              tone="primary"
              label="Volumen total"
              value={`${stats.totalVolume.toFixed(0)} kg`}
              icon={<Ionicons name="barbell-outline" size={20} color="#6366F1" />}
              size="compact"
            />
          </View>
        </View>

        <MetricTile
          label="Series completadas"
          tone="neutral"
          icon={<Ionicons name="checkmark-done-outline" size={20} color={isDark ? '#6EE7B7' : '#047857'} />}
          size="compact"
          valueContent={
            <View className="flex-row items-baseline">
              <Text className="text-xl font-bold" style={{ color: primaryText }}>
                {stats.setsCompleted}
              </Text>
              <Text
                className="text-sm font-semibold ml-1"
                style={{ color: secondaryText }}
              >
                / {stats.totalSets}
              </Text>
            </View>
          }
        />

        <Card style={{ borderColor: cardBorder }}>
          <View className="p-4 gap-3">
            <Text className="text-base font-bold" style={{ color: primaryText }}>
              Agregar nota (opcional)
            </Text>
            <TextInput
              className="border rounded-xl p-3 min-h-32"
              style={{
                borderColor: cardBorder,
                color: primaryText,
                backgroundColor: isDark ? '#1F2937' : '#ffffff',
                textAlignVertical: 'top',
              }}
              placeholder="Como te sentiste? Alguna observacion?"
              placeholderTextColor={secondaryText}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={500}
            />
            <Text className="text-xs text-right" style={{ color: secondaryText }}>
              {notes.length}/500
            </Text>
          </View>
        </Card>

        {tokensEarned > 0 ? (
          <MetricTile
            label="Tokens ganados"
            value={`+${tokensEarned}`}
            tone="success"
            highlight
            size="compact"
            icon={<Ionicons name="sparkles" size={20} color="#F59E0B" />}
          />
        ) : null}

        <Button onPress={handleFinish} className="w-full mt-2" disabled={isSaving}>
          {isSaving ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#ffffff" size="small" />
              <ButtonText>Guardando...</ButtonText>
            </View>
          ) : (
            <ButtonText>Terminar</ButtonText>
          )}
        </Button>
      </SurfaceScreen>
    </KeyboardAvoidingView>
  );
};

export default RoutineCompletedScreen;
