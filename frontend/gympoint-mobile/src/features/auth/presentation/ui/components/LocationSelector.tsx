import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, ButtonText } from '@shared/components/ui';
import { PROVINCES } from '@features/auth/domain/constants/provinces';

const SelectButton = styled(TouchableOpacity)`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.card};
  padding: 12px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
`;

const SelectText = styled(Text)<{ $placeholder?: boolean }>`
  color: ${({ theme, $placeholder }) => 
    $placeholder ? theme.colors.subtext : theme.colors.text};
  font-size: 16px;
`;

const ModalContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled(View)`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  width: 90%;
  max-height: 70%;
  padding: 20px;
`;

const ModalTitle = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
`;

const OptionButton = styled(TouchableOpacity)`
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const OptionText = styled(Text)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
`;

interface Props {
  value: string;
  onChange: (location: string) => void;
}

export function LocationSelector({ value, onChange }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (location: string) => {
    onChange(location);
    setModalVisible(false);
  };

  return (
    <>
      <SelectButton onPress={() => setModalVisible(true)}>
        <SelectText $placeholder={!value}>
          {value || 'Selecciona tu localidad'}
        </SelectText>
        <Ionicons name="chevron-down" size={20} />
      </SelectButton>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <ModalContainer>
          <ModalContent>
            <ModalTitle>Selecciona tu localidad</ModalTitle>
            <ScrollView>
              {PROVINCES.map((province) => (
                <OptionButton
                  key={province.value}
                  onPress={() => handleSelect(province.label)}
                >
                  <OptionText>{province.label}</OptionText>
                </OptionButton>
              ))}
            </ScrollView>
            <Button onPress={() => setModalVisible(false)} style={{ marginTop: 12 }}>
              <ButtonText>Cancelar</ButtonText>
            </Button>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </>
  );
}

