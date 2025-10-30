import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { Review } from '../../../domain/entities/Review';
import { ReviewCard } from './ReviewCard';

interface ReviewsListProps {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  pagination?: {
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  currentUserId?: number;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onHelpful?: (reviewId: number) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  emptyMessage?: string;
}

/**
 * Componente para mostrar lista de reviews con paginación
 * Usa map en lugar de FlatList para evitar error de VirtualizedList anidado
 */
export function ReviewsList({
  reviews,
  isLoading,
  error,
  pagination,
  currentUserId,
  onRefresh,
  onLoadMore,
  onHelpful,
  onEdit,
  onDelete,
  emptyMessage = 'No hay reseñas aún. ¡Sé el primero en dejar una!',
}: ReviewsListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Loading state
  if (isLoading && reviews.length === 0) {
    return (
      <View className="py-12 items-center">
        <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#3B82F6'} />
        <Text className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Cargando reseñas...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && reviews.length === 0) {
    return (
      <View className="py-12 items-center px-6">
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={isDark ? '#EF4444' : '#DC2626'}
        />
        <Text className={`mt-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {error}
        </Text>
        {onRefresh && (
          <TouchableOpacity
            onPress={handleRefresh}
            className="mt-4 bg-primary px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <View className="py-12 items-center px-6">
        <Ionicons
          name="chatbubbles-outline"
          size={48}
          color={isDark ? '#6B7280' : '#9CA3AF'}
        />
        <Text
          className={`mt-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Lista de reseñas usando map en lugar de FlatList para evitar error de VirtualizedList anidado */}
      {reviews.map((item) => (
        <ReviewCard
          key={`review-${item.id}`}
          review={item}
          isOwnReview={currentUserId === item.userId}
          onHelpful={onHelpful}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {/* Footer - Load More / Paginación */}
      {pagination && (
        <View className="py-4">
          {isLoading && (
            <ActivityIndicator size="small" color={isDark ? '#60A5FA' : '#3B82F6'} />
          )}

          {pagination.hasNextPage && !isLoading && onLoadMore && (
            <TouchableOpacity
              onPress={onLoadMore}
              className={`mx-auto px-6 py-3 rounded-lg ${
                isDark ? 'bg-surface-dark' : 'bg-white'
              }`}
              style={{
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            >
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cargar más reseñas
              </Text>
            </TouchableOpacity>
          )}

          {pagination && (
            <Text
              className={`text-center text-xs mt-3 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              Página {pagination.page} de {pagination.totalPages}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
