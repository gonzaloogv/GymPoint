import { useState } from 'react';
import { Modal, TouchableOpacity, View, Text, FlatList } from 'react-native';
import styled from 'styled-components/native';


interface Option {
  label: string;
  value: string;
}

interface Props {
  value?: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
}

export function Select({ value, options, placeholder = "Seleccionar...", onChange }: Props) {
  const [visible, setVisible] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <SelectBox>
          <SelectText>{selectedLabel}</SelectText>
        </SelectBox>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <ModalContainer>
          <ModalCard>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <OptionText>{item.label}</OptionText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setVisible(false)}>
              <CancelText>Cancelar</CancelText>
            </TouchableOpacity>
          </ModalCard>
        </ModalContainer>
      </Modal>
    </>
  );
}

const SelectBox = styled.View`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
`;

const SelectText = styled.Text`
  font-size: 14px;
  color: #333;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
  background: rgba(0,0,0,0.3);
`;

const ModalCard = styled.View`
  background: #fff;
  padding: 20px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  max-height: 50%;
`;

const OptionText = styled.Text`
  padding: 12px 0;
  font-size: 16px;
`;

const CancelText = styled.Text`
  text-align: center;
  color: #007bff;
  font-size: 16px;
  margin-top: 12px;
`;
