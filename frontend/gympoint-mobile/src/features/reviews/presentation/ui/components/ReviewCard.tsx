import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Review } from '../../../domain/entities/Review';
import { RatingStars } from './RatingStars';
import { getRelativeTimeString } from '@shared/utils/dateUtils';

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: number) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  isOwnReview?: boolean;
  className?: string;
}

/**
 * Componente para mostrar una review individual
 */
export function ReviewCard({
  review,
  onHelpful,
  onEdit,
  onDelete,
  isOwnReview = false,
  className,
}: ReviewCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const timeAgo = getRelativeTimeString(review.createdAt);

  const hasDetailedRatings =
    review.cleanlinessRating ||
    review.equipmentRating ||
    review.staffRating ||
    review.valueRating;

  return (
    <View
      className={`rounded-xl p-4 mb-3 ${
        isDark ? 'bg-surface-dark' : 'bg-white'
      } ${className || ''}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      {/* Header: Avatar + Name + Rating */}
      <View className="flex-row items-start mb-3">
        {/* Avatar */}
        <View className="mr-3">
          {review.author?.profilePictureUrl ? (
            <Image
              source={{ uri: review.author.profilePictureUrl }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <Ionicons
                name="person"
                size={24}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </View>
          )}
        </View>

        {/* Name, Time, Rating */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className={`font-semibold text-base ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {review.author?.name}
              {review.author?.lastname && ` ${review.author.lastname}`}
            </Text>

            {/* Actions for own review */}
            {isOwnReview && (onEdit || onDelete) && (
              <View className="flex-row">
                {onEdit && (
                  <TouchableOpacity
                    onPress={() => onEdit(review)}
                    className="ml-2 p-1"
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={isDark ? '#60A5FA' : '#3B82F6'}
                    />
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity
                    onPress={() => onDelete(review.id)}
                    className="ml-2 p-1"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <Text
            className={`text-xs mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {timeAgo}
            {review.isVerified && (
              <Text className="text-green-600 dark:text-green-400">
                {' '}• Verificado
              </Text>
            )}
          </Text>

          {/* Overall Rating */}
          <RatingStars rating={review.rating} size={14} showNumber={false} />
        </View>
      </View>

      {/* Title */}
      {review.title && (
        <Text
          className={`font-bold text-base mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {review.title}
        </Text>
      )}

      {/* Comment */}
      {review.comment && (
        <Text
          className={`text-sm leading-5 mb-3 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {review.comment}
        </Text>
      )}

      {/* Detailed Ratings */}
      {hasDetailedRatings && (
        <View
          className={`rounded-lg p-3 mb-3 ${
            isDark ? 'bg-surface-dark/50' : 'bg-gray-50'
          }`}
        >
          <Text
            className={`text-xs font-medium mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Calificaciones detalladas
          </Text>

          <View className="space-y-1">
            {review.cleanlinessRating && (
              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Limpieza
                </Text>
                <RatingStars
                  rating={review.cleanlinessRating}
                  size={12}
                  showNumber={false}
                />
              </View>
            )}

            {review.equipmentRating && (
              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Equipamiento
                </Text>
                <RatingStars
                  rating={review.equipmentRating}
                  size={12}
                  showNumber={false}
                />
              </View>
            )}

            {review.staffRating && (
              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Personal
                </Text>
                <RatingStars
                  rating={review.staffRating}
                  size={12}
                  showNumber={false}
                />
              </View>
            )}

            {review.valueRating && (
              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Relación calidad-precio
                </Text>
                <RatingStars
                  rating={review.valueRating}
                  size={12}
                  showNumber={false}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer: Helpful Button */}
      {onHelpful && !isOwnReview && (
        <TouchableOpacity
          onPress={() => onHelpful(review.id)}
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <Ionicons
            name="thumbs-up-outline"
            size={16}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            className={`ml-2 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Útil {review.helpfulCount > 0 && `(${review.helpfulCount})`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
