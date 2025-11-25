import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface MeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: MeasurementData) => void;
  initialData?: MeasurementData | null;
  mode?: 'create' | 'edit';
}

export interface MeasurementData {
  date: string;
  weight_kg?: string;
  height_cm?: string;
  body_fat_percentage?: string;
  muscle_mass_kg?: string;
  waist_cm?: string;
  chest_cm?: string;
  arms_cm?: string;
  notes?: string;
}

export function MeasurementModal({ visible, onClose, onSave, initialData = null, mode = 'create' }: MeasurementModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estado del formulario
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Información básica
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // Métricas avanzadas
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');

  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<{ weight?: string; height?: string }>({});

  // Cargar datos iniciales cuando el modal se abre en modo edición
  useEffect(() => {
    if (visible && initialData) {
      setDate(initialData.date);
      setWeight(initialData.weight_kg || '');
      setHeight(initialData.height_cm || '');
      setBodyFat(initialData.body_fat_percentage || '');
      setMuscleMass(initialData.muscle_mass_kg || '');
      setWaist(initialData.waist_cm || '');
      setChest(initialData.chest_cm || '');
      setArms(initialData.arms_cm || '');
      setNotes(initialData.notes || '');

      // Mostrar sección avanzada si hay datos en ella
      const hasAdvancedData = initialData.body_fat_percentage || initialData.muscle_mass_kg ||
                              initialData.waist_cm || initialData.chest_cm || initialData.arms_cm;
      setShowAdvanced(!!hasAdvancedData);
    }
  }, [visible, initialData]);

  const handleSave = useCallback(() => {
    // Validar que al menos peso o altura estén presentes
    if (!weight.trim() && !height.trim()) {
      setErrors({ weight: 'Debes ingresar al menos peso o altura' });
      return;
    }

    console.log('[MeasurementModal] Guardando datos:', {
      date,
      weight_kg: weight || undefined,
      height_cm: height || undefined,
      body_fat_percentage: bodyFat || undefined,
      muscle_mass_kg: muscleMass || undefined,
      waist_cm: waist || undefined,
      chest_cm: chest || undefined,
      arms_cm: arms || undefined,
      notes: notes || undefined,
    });

    onSave({
      date,
      weight_kg: weight || undefined,
      height_cm: height || undefined,
      body_fat_percentage: bodyFat || undefined,
      muscle_mass_kg: muscleMass || undefined,
      waist_cm: waist || undefined,
      chest_cm: chest || undefined,
      arms_cm: arms || undefined,
      notes: notes || undefined,
    });

    // Reset form solo en modo create
    if (mode === 'create') {
      resetForm();
    }
  }, [date, weight, height, bodyFat, muscleMass, waist, chest, arms, notes, mode, onSave]);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setWeight('');
    setHeight('');
    setBodyFat('');
    setMuscleMass('');
    setWaist('');
    setChest('');
    setArms('');
    setNotes('');
    setShowAdvanced(false);
    setErrors({});
  };

  const handleClose = useCallback(() => {
    if (mode === 'create') {
      resetForm();
    }
    onClose();
  }, [mode, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className={`w-full rounded-t-3xl p-6 ${
            isDark ? 'bg-gray-900' : 'bg-white'
          }`}
          style={{ maxHeight: '90%' }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {mode === 'edit' ? 'Editar medición' : 'Nueva medición'}
            </Text>
            <Pressable onPress={handleClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Fecha - Solo lectura en modo edición */}
            <View className="mb-6">
              <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Fecha de medición
              </Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                editable={mode === 'create'}
                className={`border rounded-lg p-4 text-base ${
                  mode === 'edit'
                    ? isDark
                      ? 'bg-gray-800/50 border-gray-700 text-gray-500'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                    : isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
              {mode === 'edit' && (
                <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  La fecha no se puede modificar en modo edición
                </Text>
              )}
            </View>

            {/* Sección: Información Básica */}
            <View className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
              <View className="flex-row items-center mb-4">
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={isDark ? '#60A5FA' : '#3B82F6'}
                />
                <Text className={`text-base font-semibold ml-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  Información Básica
                </Text>
              </View>

              {/* Peso */}
              <View className="mb-4">
                <Text className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Peso (kg)
                </Text>
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
                      ? 'bg-gray-900 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </View>

              {/* Altura */}
              <View>
                <Text className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Altura (cm)
                </Text>
                <TextInput
                  placeholder="Ej: 175"
                  value={height}
                  onChangeText={(text) => {
                    setHeight(text);
                    if (errors.height) setErrors({});
                  }}
                  keyboardType="decimal-pad"
                  className={`border rounded-lg p-4 text-base ${
                    isDark
                      ? 'bg-gray-900 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </View>

              {errors.weight && (
                <Text className="text-red-500 text-sm mt-2">{errors.weight}</Text>
              )}
            </View>

            {/* Toggle Métricas Avanzadas */}
            <Pressable
              onPress={() => setShowAdvanced(!showAdvanced)}
              className={`mb-4 p-4 rounded-xl flex-row items-center justify-between ${
                isDark ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="fitness"
                  size={20}
                  color={isDark ? '#C084FC' : '#9333EA'}
                />
                <Text className={`font-semibold ml-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                  Métricas Avanzadas (opcional)
                </Text>
              </View>
              <Ionicons
                name={showAdvanced ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isDark ? '#C084FC' : '#9333EA'}
              />
            </Pressable>

            {/* Sección: Métricas Avanzadas */}
            {showAdvanced && (
              <View className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-purple-50'}`}>
                {/* Body Fat Percentage */}
                <View className="mb-4">
                  <Text className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    % Grasa corporal
                  </Text>
                  <TextInput
                    placeholder="Ej: 18.5"
                    value={bodyFat}
                    onChangeText={setBodyFat}
                    keyboardType="decimal-pad"
                    className={`border rounded-lg p-4 text-base ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </View>

                {/* Muscle Mass */}
                <View className="mb-4">
                  <Text className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Masa muscular (kg)
                  </Text>
                  <TextInput
                    placeholder="Ej: 45.2"
                    value={muscleMass}
                    onChangeText={setMuscleMass}
                    keyboardType="decimal-pad"
                    className={`border rounded-lg p-4 text-base ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </View>

                {/* Cintura */}
                <View className="mb-4">
                  <Text className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cintura (cm)
                  </Text>
                  <TextInput
                    placeholder="Ej: 85"
                    value={waist}
                    onChangeText={setWaist}
                    keyboardType="decimal-pad"
                    className={`border rounded-lg p-4 text-base ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </View>

                {/* Pecho */}
                <View className="mb-4">
                  <Text className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Pecho (cm)
                  </Text>
                  <TextInput
                    placeholder="Ej: 100"
                    value={chest}
                    onChangeText={setChest}
                    keyboardType="decimal-pad"
                    className={`border rounded-lg p-4 text-base ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </View>

                {/* Brazos */}
                <View>
                  <Text className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Brazos (cm)
                  </Text>
                  <TextInput
                    placeholder="Ej: 35"
                    value={arms}
                    onChangeText={setArms}
                    keyboardType="decimal-pad"
                    className={`border rounded-lg p-4 text-base ${
                      isDark
                        ? 'bg-gray-900 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </View>
              </View>
            )}

            {/* Notas */}
            <View className="mb-8">
              <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notas (opcional)
              </Text>
              <TextInput
                placeholder="Añade notas sobre esta medición..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                className={`border rounded-lg p-4 text-base ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                style={{ textAlignVertical: 'top' }}
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
                <Text className="text-white font-semibold text-base">
                  {mode === 'edit' ? 'Actualizar' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
