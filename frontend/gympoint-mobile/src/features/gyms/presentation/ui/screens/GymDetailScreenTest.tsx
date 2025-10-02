import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { GymDetailScreenProps } from './GymDetailScreen.types';

type Props = GymDetailScreenProps & {
  dataSource?: 'api' | 'mocks' | null;
};

export function GymDetailScreenTest({ gym, onBack, onCheckIn, dataSource }: Props) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>🏋️ Gimnasio Cargado</Text>
        <Text style={styles.text}>Nombre: {gym.name}</Text>
        <Text style={styles.text}>Dirección: {gym.address}</Text>
        <Text style={styles.text}>Distancia: {gym.distance.toFixed(1)} km</Text>
        <Text style={styles.text}>Horarios: {gym.hours}</Text>
        <Text style={styles.text}>Precio: ${gym.price || 'No disponible'}</Text>
        <Text style={styles.text}>Servicios: {gym.services.join(', ') || 'No disponibles'}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>🎯 Información de Debug</Text>
        <Text style={styles.debugText}>ID: {gym.id}</Text>
        <Text style={styles.debugText}>Coordenadas: {gym.coordinates.join(', ')}</Text>
        <Text style={styles.debugText}>En rango: {gym.distance <= 0.15 ? 'Sí' : 'No'}</Text>
        <Text style={styles.debugText}>Rating: {gym.rating || 'No disponible'}</Text>
        <Text style={[styles.debugText, { fontWeight: 'bold', color: dataSource === 'api' ? '#4CAF50' : '#FF9800' }]}>
          Origen: {dataSource === 'api' ? '🌐 API' : dataSource === 'mocks' ? '📦 Mocks' : '❓ Desconocido'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>⚙️ Equipamiento</Text>
        {gym.equipment ? (
          gym.equipment.map((eq, index) => (
            <View key={index} style={styles.equipmentSection}>
              <Text style={styles.equipmentCategory}>{eq.icon} {eq.category}</Text>
              {eq.items.map((item, itemIndex) => (
                <Text key={itemIndex} style={styles.equipmentItem}>
                  • {item.name} (x{item.quantity})
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.debugText}>No hay equipamiento disponible</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  section: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  debugText: {
    fontSize: 12,
    marginBottom: 2,
    color: '#888',
    fontFamily: 'monospace',
  },
  equipmentSection: {
    marginBottom: 8,
  },
  equipmentCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#444',
  },
  equipmentItem: {
    fontSize: 12,
    marginLeft: 16,
    marginBottom: 2,
    color: '#666',
  },
});
