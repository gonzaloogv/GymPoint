import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@shared/hooks';
import { Button } from '@shared/components/ui';
import { PROVINCES } from '@features/auth/domain/constants/provinces';

interface Props {
  value: string;
  onChange: (location: string) => void;
  className?: string;
}

export const LocationSelector: React.FC<Props> = ({
  value,
  onChange,
  className = '',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSelect = (location: string) => {
    onChange(location);
    setModalVisible(false);
  };

  // --- Theme-dependent classes ---
  const selectButtonClasses = isDark
    ? 'border-border-dark bg-surface-dark'
    : 'border-border bg-surface';
  
  const placeholderColor = isDark ? 'text-textSecondary-dark' : 'text-textSecondary';
  const valueColor = isDark ? 'text-text-dark' : 'text-text';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280'; // Colores de Tailwind gray-400 / gray-500
  const modalContentClasses = isDark ? 'bg-surface-dark' : 'bg-surface';
  const optionBorderColor = isDark ? 'border-border-dark' : 'border-border';

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        className={`
          border rounded-lg p-3 flex-row justify-between items-center min-h-[48px]
          ${selectButtonClasses}
          ${className}
        `}
      >
        <Text className={`text-base ${value ? valueColor : placeholderColor}`}>
          {value || 'Selecciona tu provincia'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={iconColor} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={`
              rounded-xl w-[90%] max-h-[70%] p-5
              ${modalContentClasses}
            `}
          >
            <Text className={`text-lg font-bold mb-4 ${valueColor}`}>
              Selecciona tu provincia
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {PROVINCES.map((province) => (
                <TouchableOpacity
                  key={province.value}
                  onPress={() => handleSelect(province.label)}
                  className={`p-4 border-b ${optionBorderColor}`}
                >
                  <Text className={`text-base ${valueColor}`}>
                    {province.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              onPress={() => setModalVisible(false)}
              variant="secondary"
              fullWidth
              className="mt-3"
            >
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
};