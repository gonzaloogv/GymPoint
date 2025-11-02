import React, { ReactNode } from 'react';
import { Modal, ScrollView, TouchableOpacity, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

export interface SelectorItem<T = any> {
  id: string | number;
  label: string;
  description?: string;
  metadata?: string[];
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string;
  value: T;
}

interface SelectorModalProps<T> {
  visible: boolean;
  title: string;
  subtitle?: string;
  items: SelectorItem<T>[];
  selectedId?: string | number;
  onSelect: (item: SelectorItem<T>) => void;
  onClose: () => void;
  renderCustomContent?: (item: SelectorItem<T>) => ReactNode;
}

export function SelectorModal<T = any>({
  visible,
  title,
  subtitle,
  items,
  selectedId,
  onSelect,
  onClose,
  renderCustomContent,
}: SelectorModalProps<T>) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-center items-center"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className={`mx-4 max-h-96 rounded-xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{ width: '90%', maxWidth: 400 }}
        >
          {/* Header */}
          <View className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </Text>
            {subtitle && (
              <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Items List */}
          <ScrollView className="max-h-80">
            {items.map((item) => {
              const isSelected = item.id === selectedId;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className={`p-4 border-b ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  } ${isSelected ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50') : ''}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        {item.icon && (
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color={
                              isSelected
                                ? (isDark ? '#60A5FA' : '#3B82F6')
                                : (isDark ? '#9CA3AF' : '#6B7280')
                            }
                          />
                        )}
                        <Text
                          className={`text-base font-semibold ${
                            isSelected
                              ? (isDark ? 'text-blue-400' : 'text-blue-600')
                              : (isDark ? 'text-white' : 'text-gray-900')
                          }`}
                        >
                          {item.label}
                        </Text>
                        {item.badge && (
                          <View className={`px-2 py-0.5 rounded ${
                            isDark ? 'bg-green-900/30' : 'bg-green-100'
                          }`}>
                            <Text className={`text-xs font-semibold ${
                              isDark ? 'text-green-400' : 'text-green-700'
                            }`}>
                              {item.badge}
                            </Text>
                          </View>
                        )}
                      </View>

                      {item.description && (
                        <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.description}
                        </Text>
                      )}

                      {item.metadata && item.metadata.length > 0 && (
                        <View className="flex-row gap-3 mt-2">
                          {item.metadata.map((meta, idx) => (
                            <Text key={idx} className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {meta}
                            </Text>
                          ))}
                        </View>
                      )}

                      {renderCustomContent && renderCustomContent(item)}
                    </View>

                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={isDark ? '#60A5FA' : '#3B82F6'}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <Pressable
              onPress={onClose}
              className={`py-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <Text className={`text-center font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cerrar
              </Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
