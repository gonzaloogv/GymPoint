import React, { useMemo } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Button } from '@shared/components/ui';

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

  const palette = useMemo(
    () => ({
      overlay: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(17, 24, 39, 0.45)',
      background: isDark ? '#111827' : '#ffffff',
      border: isDark ? 'rgba(55, 65, 81, 0.6)' : '#E5E7EB',
      title: isDark ? '#F9FAFB' : '#111827',
      body: isDark ? '#9CA3AF' : '#4B5563',
    }),
    [isDark],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.background,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.grabber} />
          <Text style={[styles.title, { color: palette.title }]}>Sesion incompleta</Text>
          <Text style={[styles.bodyText, { color: palette.body }]}>
            Tienes una sesion incompleta de {routineName}. Continua donde lo dejaste o cierra
            para iniciar otra.
          </Text>
          <View style={styles.actions}>
            <Button fullWidth onPress={onContinue}>
              Continuar entrenamiento
            </Button>
            <Button variant="secondary" fullWidth onPress={onClose}>
              Cerrar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
  },
  grabber: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.35)',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  actions: {
    gap: 12,
  },
});

