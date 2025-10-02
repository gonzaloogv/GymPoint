// SelectUsageExample.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'; // Importación correcta de SafeAreaView
import { Select } from '@shared/components/ui'; // Ajusta la ruta de importación si es necesario
import { PROVINCES } from '../../domain/constants/provinces';

export default function SelectUsageExample() {
  // State para almacenar el valor de la provincia seleccionada (e.g., 'BA', 'CH', etc.)
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined);

  // Handler para cuando se selecciona una opción
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    console.log('Provincia seleccionada:', value); // Verifica el nuevo valor
  };

  // Encuentra el label de la provincia seleccionada
  const selectedProvinceLabel = PROVINCES.find(p => p.value === selectedProvince)?.label;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Selector de Provincia 🇦🇷</Text>
        
        {/* Componente Select */}
        <Select
          value={selectedProvince}
          options={PROVINCES}
          placeholder="Selecciona una Provincia"
          onChange={handleProvinceChange}
        />
        
        {/* Muestra el valor seleccionado */}
        <Text style={styles.selectedValueText}>
          {selectedProvince
            ? `Has seleccionado: ${selectedProvinceLabel} (${selectedProvince})`
            : 'Aún no has seleccionado una provincia.'
          }
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedValueText: {
    marginTop: 30,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});