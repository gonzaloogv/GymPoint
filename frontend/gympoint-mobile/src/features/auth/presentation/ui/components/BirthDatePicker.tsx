import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface BirthDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
}

/**
 * BirthDatePicker - Componente para seleccionar fecha de nacimiento
 * Usa DateTimePicker en iOS/Android y input type="date" en web
 */
export const BirthDatePicker: React.FC<BirthDatePickerProps> = ({ value, onChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [show, setShow] = useState(false);

  const handleOpenPicker = () => {
    setShow(true);
  };

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate);

      // En Android, cerrar el picker automáticamente después de seleccionar
      if (Platform.OS === 'android') {
        setShow(false);
      }
    } else {
      // Usuario canceló en Android
      setShow(false);
    }
  };

  const handleConfirm = () => {
    setShow(false);
  };

  // Manejador para input web
  const handleWebDateChange = (text: string) => {
    if (text) {
      const date = new Date(text + 'T00:00:00');
      onChange(date);
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

  // Formato YYYY-MM-DD para input HTML
  const getWebDateValue = () => {
    if (!value) return '';
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const bgColor = isDark ? 'bg-surface-dark' : 'bg-surface';
  const textColor = isDark ? 'text-text-dark' : 'text-text';
  const placeholderColor = isDark ? 'text-textSecondary-dark' : 'text-textSecondary';

  // Render para web
  if (Platform.OS === 'web') {
    const inputBgColor = isDark ? '#FFFFFF' : '#FFFFFF';
    const inputTextColor = isDark ? '#1A1A1A' : '#1A1A1A';
    const borderColorValue = isDark ? '#9CA3AF' : '#DDDDDD';

    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: borderColorValue,
        position: 'relative',
      } as any}>
        <style>{`
          input[type="date"] {
            color: ${inputTextColor};
            background-color: ${inputBgColor};
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: ${isDark ? 'invert(1)' : 'invert(0)'};
            cursor: pointer;
          }
        `}</style>
        <input
          type="date"
          value={getWebDateValue()}
          onChange={(e) => handleWebDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          style={{
            flex: 1,
            backgroundColor: inputBgColor,
            border: 'none',
            color: inputTextColor,
            fontSize: 16,
            fontFamily: 'system-ui',
            outline: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            caretColor: inputTextColor,
            padding: '12px 16px',
            borderRadius: '8px',
          } as any}
        />
        <Feather
          name="calendar"
          size={20}
          color={isDark ? '#E3E3E3' : '#49454F'}
          style={{ marginRight: 16 }}
        />
      </View>
    );
  }

  // Render para iOS/Android
  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleOpenPicker}
        className={`flex-row items-center justify-between px-4 py-3 rounded-lg border ${
          isDark ? 'border-border-dark' : 'border-border'
        } ${bgColor}`}
      >
        <Text className={`flex-1 ${value ? textColor : placeholderColor}`}>
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
          activeOpacity={0.7}
          onPress={handleConfirm}
          className="mt-2 py-2 px-4 bg-primary rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Confirmar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};