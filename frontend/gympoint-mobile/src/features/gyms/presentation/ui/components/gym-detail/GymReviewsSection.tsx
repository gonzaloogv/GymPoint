import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { InfoCard } from '@shared/components/ui';
import { Review, ReviewsList, RatingStars, RatingStats } from '@features/reviews';

interface GymReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  ratingStats: RatingStats | null;
  isLoading: boolean;
  pagination: any;
  currentUserId?: number;
  hasMyReview: boolean;
  onCreateReview: () => void;
  onRefresh: () => Promise<void>;
  onLoadMore?: () => void;
  onHelpful: (reviewId: number) => Promise<void>;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: number) => Promise<void>;
}

export function GymReviewsSection({
  reviews,
  averageRating,
  ratingStats,
  isLoading,
  pagination,
  currentUserId,
  hasMyReview,
  onCreateReview,
  onRefresh,
  onLoadMore,
  onHelpful,
  onEdit,
  onDelete,
}: GymReviewsSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const filteredReviews = reviews.filter((r) => r.userId !== currentUserId);

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center mr-3"
          style={{
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.24)' : 'rgba(250, 204, 21, 0.18)',
            borderColor: isDark ? 'rgba(250, 204, 21, 0.38)' : 'rgba(250, 204, 21, 0.24)',
          }}
        >
          <Ionicons name="star" size={22} color={isDark ? '#FCD34D' : '#F59E0B'} />
        </View>
        <Text
          className="flex-1 text-lg font-bold"
          style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
        >
          Reseñas
        </Text>
        {!hasMyReview && (
          <TouchableOpacity className="flex-row items-center gap-1.5" onPress={onCreateReview} activeOpacity={0.75}>
            <Ionicons name="add-circle-outline" size={22} color={isDark ? '#60A5FA' : '#2563EB'} />
            <Text className="text-[13px] font-semibold" style={{ color: isDark ? '#60A5FA' : '#2563EB' }}>
              Escribir
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      {ratingStats && ratingStats.totalReviews > 0 && (
        <View
          className="rounded-2xl px-4 py-3 flex-row items-center justify-between mb-4"
          style={{
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.6)' : '#F9FAFB',
          }}
        >
          <RatingStars rating={averageRating} size={20} />
          <Text
            className="text-[13px] font-medium"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'reseña' : 'reseñas'}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View
        className="mb-4"
        style={{
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(212, 212, 216, 0.7)',
        }}
      />

      {/* Reviews List */}
      <ReviewsList
        reviews={filteredReviews}
        isLoading={isLoading}
        error={null}
        pagination={pagination}
        currentUserId={currentUserId}
        onRefresh={onRefresh}
        onLoadMore={pagination?.hasNextPage ? onLoadMore : undefined}
        onHelpful={onHelpful}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage="No hay reseñas aún. ¡Sé el primero en dejar una!"
      />
    </InfoCard>
  );
}

