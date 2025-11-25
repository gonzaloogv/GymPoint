import React from 'react';
import { View, Text, Switch, ViewStyle } from 'react-native';
import { palette } from '@shared/styles';

/**
 * SwitchRow - Componente reutilizable de fila con switch
 * Configurado con colores estándar de la app
 */

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: ViewStyle;
}

export function SwitchRow({ label, value, onValueChange, style }: SwitchRowProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 16, color: '#000' }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.switchTrackOff, true: palette.switchTrackOn }}
        thumbColor={palette.switchThumb}
      />
    </View>
  );
}
