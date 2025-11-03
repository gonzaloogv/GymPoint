/**
 * NotificationSettingsScreen - Pantalla de configuración de notificaciones
 * Integrada con backend: GET/PUT /api/users/me/notifications/settings
 */

import React from 'react';
import { ScrollView, View, Text, ActivityIndicator, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { useTheme } from '@shared/hooks';
import { lightTheme } from '@presentation/theme';

export const NotificationSettingsScreen: React.FC = () => {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const theme = lightTheme;

  const {
    loading,
    settings,
    error,
    toggleNotificationType,
    togglePushNotifications,
    toggleEmailNotifications,
  } = useNotificationSettings();

  // Loading state
  if (loading && !settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando configuración...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Configuración de Notificaciones</Text>
          <Text style={styles.subtitle}>
            Personaliza qué notificaciones deseas recibir
          </Text>
        </View>

        {/* Sección: Canales Globales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canales de Notificación</Text>

          <SettingRow
            label="Notificaciones Push"
            description="Recibir notificaciones push en tu dispositivo"
            value={settings?.pushEnabled ?? false}
            onToggle={togglePushNotifications}
            disabled={loading}
          />

          <SettingRow
            label="Notificaciones por Email"
            description="Recibir notificaciones en tu correo electrónico"
            value={settings?.emailEnabled ?? false}
            onToggle={toggleEmailNotifications}
            disabled={loading}
          />
        </View>

        {/* Sección: Tipos de Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Notificaciones</Text>

          <SettingRow
            label="Recordatorios"
            description="Recordatorios de entrenamientos y rutinas"
            value={settings?.remindersEnabled ?? false}
            onToggle={() => toggleNotificationType('remindersEnabled')}
            disabled={loading}
          />

          <SettingRow
            label="Logros"
            description="Notificaciones de logros y metas alcanzadas"
            value={settings?.achievementsEnabled ?? false}
            onToggle={() => toggleNotificationType('achievementsEnabled')}
            disabled={loading}
          />

          <SettingRow
            label="Recompensas"
            description="Nuevas recompensas y tokens ganados"
            value={settings?.rewardsEnabled ?? false}
            onToggle={() => toggleNotificationType('rewardsEnabled')}
            disabled={loading}
          />

          <SettingRow
            label="Novedades de Gimnasios"
            description="Actualizaciones de tus gimnasios favoritos"
            value={settings?.gymUpdatesEnabled ?? false}
            onToggle={() => toggleNotificationType('gymUpdatesEnabled')}
            disabled={loading}
          />

          <SettingRow
            label="Pagos"
            description="Notificaciones de pagos y suscripciones"
            value={settings?.paymentEnabled ?? false}
            onToggle={() => toggleNotificationType('paymentEnabled')}
            disabled={loading}
          />

          <SettingRow
            label="Social"
            description="Actividad de amigos y comunidad"
            value={settings?.socialEnabled ?? false}
            onToggle={() => toggleNotificationType('socialEnabled')}
            disabled={loading}
          />

          <SettingRow
            label="Sistema"
            description="Notificaciones importantes del sistema"
            value={settings?.systemEnabled ?? false}
            onToggle={() => toggleNotificationType('systemEnabled')}
            disabled={loading}
          />

          <SettingRow
            label="Desafíos"
            description="Invitaciones y actualizaciones de desafíos"
            value={settings?.challengeEnabled ?? false}
            onToggle={() => toggleNotificationType('challengeEnabled')}
            disabled={loading}
          />
        </View>

        {/* Sección: Horario Silencioso */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario Silencioso</Text>
          <Text style={styles.sectionDescription}>
            No recibirás notificaciones durante este período
          </Text>

          {settings?.quietHoursStart && settings?.quietHoursEnd ? (
            <View style={styles.quietHoursDisplay}>
              <Text style={styles.quietHoursText}>
                {settings.quietHoursStart} - {settings.quietHoursEnd}
              </Text>
            </View>
          ) : (
            <Text style={styles.noQuietHours}>
              No configurado
            </Text>
          )}
        </View>

        {/* Loading overlay */}
        {loading && settings && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Componente auxiliar para una fila de configuración con switch
 */
interface SettingRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  value,
  onToggle,
  disabled = false,
}) => (
  <View style={styles.settingRow}>
    <View style={styles.settingTextContainer}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
      thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E9E9E',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#757575',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#757575',
  },
  quietHoursDisplay: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quietHoursText: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  noQuietHours: {
    fontSize: 14,
    color: '#9E9E9E',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
