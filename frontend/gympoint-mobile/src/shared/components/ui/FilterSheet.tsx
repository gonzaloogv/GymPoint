import React from 'react';
import { Modal, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  onClear?: () => void;
  onApply?: () => void;
  clearLabel?: string;
  applyLabel?: string;
  children: React.ReactNode;
};

export function FilterSheet({
  visible,
  onClose,
  title,
  onClear,
  onApply,
  clearLabel = 'Limpiar',
  applyLabel = 'Aplicar',
  children,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#ffffff' : '#000000';
  const buttonTextColor = isDark ? '#ffffff' : '#ffffff';

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="fade">
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
        <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1" />

        <View
          className="max-h-70% rounded-t-2xl p-4"
          style={{ backgroundColor: cardBg }}
        >
          <Text className="font-bold text-base mb-1" style={{ color: textColor }}>
            {title}
          </Text>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {children}

            <View className="flex-row gap-1.25 mt-1.5">
              <TouchableOpacity
                onPress={onClear}
                className="flex-1 items-center justify-center min-h-12 rounded-lg border"
                style={{ borderColor: borderColor }}
              >
                <Text className="font-semibold" style={{ color: textColor }}>
                  {clearLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onApply}
                className="flex-1 items-center justify-center min-h-12 rounded-lg"
                style={{ backgroundColor: '#3B82F6' }}
              >
                <Text className="font-semibold" style={{ color: buttonTextColor }}>
                  {applyLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
