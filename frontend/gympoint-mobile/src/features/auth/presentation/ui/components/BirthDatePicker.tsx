import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface BirthDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
}

export const BirthDatePicker: React.FC<BirthDatePickerProps> = ({ value, onChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [show, setShow] = useState(false);

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Seleccionar fecha de nacimiento';
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const bgColor = isDark ? 'bg-surfaceContainer-dark' : 'bg-surface';
  const textColor = isDark ? 'text-textPrimary-dark' : 'text-textPrimary';
  const placeholderColor = isDark ? 'text-textSecondary-dark' : 'text-textSecondary';

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShow(true)}
        className={`flex-row items-center justify-between px-4 py-3 rounded-lg border ${
          isDark ? 'border-outline-dark' : 'border-outline'
        } ${bgColor}`}
      >
        <Text className={value ? textColor : placeholderColor}>
          {formatDate(value)}
        </Text>
        <Feather
          name="calendar"
          size={20}
          color={isDark ? '#E3E3E3' : '#49454F'}
        />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          textColor={isDark ? '#E3E3E3' : '#1C1B1F'}
        />
      )}

      {show && Platform.OS === 'ios' && (
        <TouchableOpacity
          onPress={() => setShow(false)}
          className="mt-2 py-2 px-4 bg-primary rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Confirmar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
