import React, { useState } from 'react';
import { Modal, TouchableOpacity, TextInput, Platform } from 'react-native';
import styled from 'styled-components/native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddMeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: MeasurementData) => void;
}

export interface MeasurementData {
  weight: string;
  bodyFat: string;
  date: Date;
}

const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContainer = styled.View`
  background-color: #ffffff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px;
  max-height: 80%;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
`;

const CloseButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`;

const CloseIcon = styled.Text`
  font-size: 24px;
  color: #6b7280;
`;

const FormField = styled.View`
  margin-bottom: 20px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const RequiredMark = styled.Text`
  color: #ef4444;
`;

const Input = styled(TextInput)`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  color: #111827;
`;

const DateTimeRow = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const DateTimeField = styled(TouchableOpacity)`
  flex: 1;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
`;

const DateTimeText = styled.Text`
  font-size: 16px;
  color: #111827;
`;

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled(TouchableOpacity)<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ variant }) => (variant === 'primary' ? '#3b82f6' : '#ffffff')};
  border: ${({ variant }) => (variant === 'primary' ? 'none' : '1px solid #e5e7eb')};
`;

const ButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ variant }) => (variant === 'primary' ? '#ffffff' : '#374151')};
`;

export const AddMeasurementModal: React.FC<AddMeasurementModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    if (!weight) {
      alert('Por favor ingresa el peso');
      return;
    }

    onSave({
      weight,
      bodyFat,
      date,
    });

    // Reset form
    setWeight('');
    setBodyFat('');
    setDate(new Date());
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setWeight('');
    setBodyFat('');
    setDate(new Date());
    onClose();
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Overlay>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <ModalContainer>
          <Header>
            <Title>Nueva medición</Title>
            <CloseButton onPress={onClose}>
              <CloseIcon>×</CloseIcon>
            </CloseButton>
          </Header>

          <FormField>
            <Label>
              Peso (kg) <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              placeholder="Ej: 72.5"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
          </FormField>

          <FormField>
            <Label>% Grasa corporal (opcional)</Label>
            <Input
              placeholder="Ej: 18.2"
              value={bodyFat}
              onChangeText={setBodyFat}
              keyboardType="decimal-pad"
            />
          </FormField>

          <FormField>
            <Label>Fecha</Label>
            <DateTimeRow>
              <DateTimeField onPress={() => setShowDatePicker(true)}>
                <DateTimeText>{formatDate(date)}</DateTimeText>
              </DateTimeField>
              <DateTimeField onPress={() => setShowTimePicker(true)}>
                <DateTimeText>{formatTime(date)}</DateTimeText>
              </DateTimeField>
            </DateTimeRow>
          </FormField>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}

          <FormField>
            <Label>Nota (opcional)</Label>
            <Input
              placeholder="Ej: Después del entrenamiento de piernas..."
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </FormField>

          <ButtonsRow>
            <Button variant="secondary" onPress={handleCancel}>
              <ButtonText variant="secondary">Cancelar</ButtonText>
            </Button>
            <Button variant="primary" onPress={handleSave}>
              <ButtonText variant="primary">Guardar</ButtonText>
            </Button>
          </ButtonsRow>
        </ModalContainer>
      </Overlay>
    </Modal>
  );
};
