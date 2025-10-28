import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface MeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: MeasurementData) => void;
}

export interface MeasurementData {
  weight: string;
  bodyFat?: string;
  date: string;
  time: string;
  note?: string;
}

export function MeasurementModal({ visible, onClose, onSave }: MeasurementModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ weight?: string }>({});

  const handleSave = useCallback(() => {
    // Validate weight
    if (!weight.trim()) {
      setErrors({ weight: 'Peso es requerido' });
      return;
    }

    onSave({
      weight,
      bodyFat: bodyFat || undefined,
      date,
      time,
      note: note || undefined,
    });

    // Reset form
    setWeight('');
    setBodyFat('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setNote('');
    setErrors({});
  }, [weight, bodyFat, date, time, note, onSave]);

  const handleClose = useCallback(() => {
    // Reset form
    setWeight('');
    setBodyFat('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setNote('');
    setErrors({});
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className={`w-full rounded-t-3xl p-6 ${
            isDark ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Nueva medición
            </Text>
            <Pressable onPress={handleClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
            {/* Weight Input */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Peso (kg)
                </Text>
                <Text className="text-red-500 ml-1 font-semibold">*</Text>
              </View>
              <TextInput
                placeholder="Ej: 72.5"
                value={weight}
                onChangeText={(text) => {
                  setWeight(text);
                  if (errors.weight) setErrors({});
                }}
                keyboardType="decimal-pad"
                className={`border rounded-lg p-4 text-base ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
              {errors.weight && (
                <Text className="text-red-500 text-sm mt-1">{errors.weight}</Text>
              )}
            </View>

            {/* Body Fat Input */}
            <View className="mb-6">
              <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                % Grasa corporal (opcional)
              </Text>
              <TextInput
                placeholder="Ej: 18.2"
                value={bodyFat}
                onChangeText={setBodyFat}
                keyboardType="decimal-pad"
                className={`border rounded-lg p-4 text-base ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </View>

            {/* Date and Time */}
            <View className="mb-6">
              <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Fecha
              </Text>
              <View className="flex-row gap-3">
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="DD/MM/YYYY"
                  className={`flex-1 border rounded-lg p-4 text-base ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
                <TextInput
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  className={`flex-1 border rounded-lg p-4 text-base ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </View>
            </View>

            {/* Note Input */}
            <View className="mb-8">
              <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Nota (opcional)
              </Text>
              <TextInput
                placeholder="Añade notas sobre esta medición..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                className={`border rounded-lg p-4 text-base ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3 mb-4">
              <Pressable
                onPress={handleClose}
                className={`flex-1 py-4 px-6 rounded-xl border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
                } items-center justify-center`}
              >
                <Text className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="flex-1 py-4 px-6 rounded-xl bg-blue-500 items-center justify-center"
              >
                <Text className="text-white font-semibold text-base">Guardar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
