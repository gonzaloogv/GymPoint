import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { Input } from '@shared/components/ui';

interface Props {
  value: string;
  onChange: (date: string) => void;
}

const PickerContainer = styled(Pressable)`
  width: 100%;
`;

export function BirthDatePicker({ value, onChange }: Props) {
  const [show, setShow] = useState(false);

  // Convertir string a Date o usar fecha por defecto (hace 25 años)
  const getDateValue = () => {
    if (value) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? getDefaultDate() : date;
    }
    return getDefaultDate();
  };

  const getDefaultDate = () => {
    const now = new Date();
    now.setFullYear(now.getFullYear() - 25);
    return now;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      onChange(formattedDate);
    }
  };

  const handlePress = () => {
    setShow(true);
  };

  const handleDismiss = () => {
    setShow(false);
  };

  return (
    <View>
      <PickerContainer onPress={handlePress}>
        <Input
          value={formatDisplayDate(value)}
          placeholder="DD/MM/AAAA"
          editable={false}
          pointerEvents="none"
        />
      </PickerContainer>

      {show && (
        <DateTimePicker
          value={getDateValue()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          {...(Platform.OS === 'ios' && {
            textColor: '#000000',
          })}
        />
      )}

      {show && Platform.OS === 'ios' && (
        <Pressable
          onPress={handleDismiss}
          style={{
            marginTop: 10,
            padding: 12,
            backgroundColor: '#007AFF',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            Confirmar
          </Text>
        </Pressable>
      )}
    </View>
  );
}
