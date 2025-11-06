import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
        <View style={styles.loading}>
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
        <View style={styles.header}>
          <Ionicons name="trophy" size={52} color={headerAccent} />
          <Text style={[styles.title, { color: primaryText }]}>Entrenamiento completado</Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            Gran trabajo. Sigue asi!
          </Text>
        </View>

        <Card style={{ borderColor: cardBorder }}>
          <View style={styles.routineInfo}>
            <Text style={[styles.sectionLabel, { color: secondaryText }]}>Rutina</Text>
            <Text style={styles.routineName}>{stats.routineName || 'Rutina sin nombre'}</Text>
          </View>
        </Card>

        <View style={styles.metricsRow}>
          <View style={styles.metricTile}>
            <MetricTile
              tone="primary"
              label="Duracion"
              value={formatDuration(stats.duration)}
              icon={<Ionicons name="time-outline" size={20} color="#6366F1" />}
              size="compact"
            />
          </View>
          <View style={[styles.metricTile, styles.metricTileSpacing]}>
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
            <View style={styles.setsValue}>
              <Text style={[styles.setsPrimary, { color: primaryText }]}>{stats.setsCompleted}</Text>
              <Text style={[styles.setsSecondary, { color: secondaryText }]}> / {stats.totalSets}</Text>
            </View>
          }
        />

        <Card style={{ borderColor: cardBorder }}>
          <View style={styles.notesCard}>
            <Text style={[styles.notesTitle, { color: primaryText }]}>Agregar nota (opcional)</Text>
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
            <Text style={[styles.notesCounter, { color: secondaryText }]}>
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
            <View style={styles.buttonContent}>
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  routineInfo: {
    padding: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  routineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
  },
  metricsRow: {
    flexDirection: 'row',
  },
  metricTile: {
    flex: 1,
  },
  metricTileSpacing: {
    marginLeft: 12,
  },
  setsValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  setsPrimary: {
    fontSize: 20,
    fontWeight: '700',
  },
  setsSecondary: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  notesCard: {
    padding: 16,
    gap: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  notesCounter: {
    fontSize: 12,
    textAlign: 'right',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
