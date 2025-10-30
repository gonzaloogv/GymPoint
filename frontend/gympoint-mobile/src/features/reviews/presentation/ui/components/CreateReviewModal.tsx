import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Review, CreateReviewData, UpdateReviewData } from '../../../domain/entities/Review';
import { RatingStarsInput } from './RatingStarsInput';

interface CreateReviewModalProps {
  visible: boolean;
  gymId: number;
  gymName: string;
  existingReview?: Review | null;
  onClose: () => void;
  onSubmit: (data: CreateReviewData | UpdateReviewData) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Modal para crear o editar una reseña de gimnasio
 */
export function CreateReviewModal({
  visible,
  gymId,
  gymName,
  existingReview,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateReviewModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Debug log
  useEffect(() => {
    if (visible) {
      console.log('[CreateReviewModal] Modal abierto para gymId:', gymId, 'gymName:', gymName);
    }
  }, [visible, gymId, gymName]);

  // Form state
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [cleanlinessRating, setCleanlinessRating] = useState(existingReview?.cleanlinessRating || 0);
  const [equipmentRating, setEquipmentRating] = useState(existingReview?.equipmentRating || 0);
  const [staffRating, setStaffRating] = useState(existingReview?.staffRating || 0);
  const [valueRating, setValueRating] = useState(existingReview?.valueRating || 0);

  // Reset form when modal opens/closes or existing review changes
  useEffect(() => {
    if (visible) {
      setRating(existingReview?.rating || 0);
      setTitle(existingReview?.title || '');
      setComment(existingReview?.comment || '');
      setCleanlinessRating(existingReview?.cleanlinessRating || 0);
      setEquipmentRating(existingReview?.equipmentRating || 0);
      setStaffRating(existingReview?.staffRating || 0);
      setValueRating(existingReview?.valueRating || 0);
    }
  }, [visible, existingReview]);

  const isValid = rating > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    const data: CreateReviewData | UpdateReviewData = existingReview
      ? {
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
          cleanlinessRating: cleanlinessRating || undefined,
          equipmentRating: equipmentRating || undefined,
          staffRating: staffRating || undefined,
          valueRating: valueRating || undefined,
        }
      : {
          gymId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
          cleanlinessRating: cleanlinessRating || undefined,
          equipmentRating: equipmentRating || undefined,
          staffRating: staffRating || undefined,
          valueRating: valueRating || undefined,
        };

    await onSubmit(data);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className={`rounded-t-3xl p-6 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
            style={{ maxHeight: '90%' }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {existingReview ? 'Editar reseña' : 'Dejar una reseña'}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                className="p-2"
              >
                <Ionicons
                  name="close"
                  size={28}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>

            {/* Gym Name */}
            <Text className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {gymName}
            </Text>

            {/* Scroll Hint */}
            <Text className={`text-xs mb-2 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              ⬇️ Desliza para ver todos los campos
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              style={{ minHeight: 300, maxHeight: 500 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Overall Rating */}
              <RatingStarsInput
                value={rating}
                onChange={setRating}
                label="Calificación general"
                required
                className="mb-6"
              />

              {/* Title */}
              <View className="mb-6">
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Título (opcional)
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Resume tu experiencia"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  maxLength={100}
                  className={`rounded-lg px-4 py-3 text-base ${
                    isDark
                      ? 'bg-surface-dark text-white border border-gray-700'
                      : 'bg-white text-gray-900 border border-gray-300'
                  }`}
                  editable={!isSubmitting}
                />
                <Text
                  className={`text-xs mt-1 text-right ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {title.length}/100
                </Text>
              </View>

              {/* Comment */}
              <View className="mb-6">
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Comentario (opcional)
                </Text>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Comparte tu experiencia con más detalle"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  multiline
                  numberOfLines={4}
                  maxLength={2000}
                  textAlignVertical="top"
                  className={`rounded-lg px-4 py-3 text-base h-32 ${
                    isDark
                      ? 'bg-surface-dark text-white border border-gray-700'
                      : 'bg-white text-gray-900 border border-gray-300'
                  }`}
                  editable={!isSubmitting}
                />
                <Text
                  className={`text-xs mt-1 text-right ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {comment.length}/2000
                </Text>
              </View>

              {/* Detailed Ratings */}
              <Text
                className={`text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Calificaciones detalladas (opcional)
              </Text>

              <View className="space-y-4 mb-6">
                <RatingStarsInput
                  value={cleanlinessRating}
                  onChange={setCleanlinessRating}
                  label="Limpieza"
                  size={24}
                />

                <RatingStarsInput
                  value={equipmentRating}
                  onChange={setEquipmentRating}
                  label="Equipamiento"
                  size={24}
                />

                <RatingStarsInput
                  value={staffRating}
                  onChange={setStaffRating}
                  label="Personal"
                  size={24}
                />

                <RatingStarsInput
                  value={valueRating}
                  onChange={setValueRating}
                  label="Relación calidad-precio"
                  size={24}
                />
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                className={`flex-1 py-4 rounded-xl ${isDark ? 'bg-surface-dark' : 'bg-gray-200'}`}
              >
                <Text
                  className={`text-center font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isValid || isSubmitting}
                className={`flex-1 py-4 rounded-xl ${
                  !isValid || isSubmitting ? 'bg-gray-400' : 'bg-primary'
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-onPrimary text-center font-semibold">
                    {existingReview ? 'Actualizar' : 'Publicar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
