import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useTheme } from "@shared/hooks";
import { SurfaceScreen, LoadMoreButton, BackButton } from "@shared/components/ui";
import {
  useGymReviews,
  useGymRatingStats,
  useReviewActions,
  Review,
  CreateReviewModal,
  CreateReviewData,
  UpdateReviewData,
} from "@features/reviews";
import { ReviewsList, RatingStars } from "@features/reviews";
import { useAuthStore } from "@features/auth";
import { useReviewUpdates } from "@shared/hooks";
import { websocketService } from "@shared/services/websocket.service";

interface ReviewsScreenProps {
  gymId: number;
  gymName: string;
  onBack: () => void;
}

export function ReviewsScreen({ gymId, gymName, onBack }: ReviewsScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuthStore();

  const [itemsToShow, setItemsToShow] = useState(5);
  const ITEMS_PER_PAGE = 5;

  const { reviews, isLoading, refetch } = useGymReviews({
    gymId,
    limit: 100,
    sortBy: "created_at",
    order: "desc",
  });

  const { stats: ratingStats } = useGymRatingStats(gymId);
  const { createReview, updateReview, deleteReview, markHelpful, unmarkHelpful, isCreating, isUpdating } = useReviewActions();

  const [showModal, setShowModal] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);

  const currentUserId = user?.id_user;

  // Sincronizar estado local con los datos del hook
  useEffect(() => {
    setDisplayReviews(reviews);
  }, [reviews]);

  // Calcular promedio real de las reseñas (fix temporal mientras backend no lo hace)
  const calculatedAverage = displayReviews.length > 0
    ? displayReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / displayReviews.length
    : 0;
  const displayRating = calculatedAverage || ratingStats?.averageRating || 0;

  const handleCreate = () => {
    setReviewToEdit(null);
    setShowModal(true);
  };

  const handleEdit = (review: Review) => {
    setReviewToEdit(review);
    setShowModal(true);
  };

  const handleSubmit = async (data: CreateReviewData | UpdateReviewData) => {
    if (reviewToEdit) {
      const result = await updateReview(reviewToEdit.id, data as UpdateReviewData);
      if (result) {
        await refetch();
        setShowModal(false);
        setReviewToEdit(null);
      }
    } else {
      const result = await createReview(data as CreateReviewData);
      if (result) {
        await refetch();
        setShowModal(false);
      }
    }
  };

  /**
   * WebSocket: unirse al room y refrescar ante eventos de reviews (nuevas, edits, votos útiles)
   * Esto mantiene la lista sincronizada en tiempo real.
   */
  useEffect(() => {
    if (gymId) {
      websocketService.joinGym(gymId);
      return () => {
        websocketService.leaveGym(gymId);
      };
    }
  }, [gymId]);

  useReviewUpdates(gymId, {
    onNewReview: async () => {
      await refetch();
    },
    onReviewUpdated: async () => {
      await refetch();
    },
    onHelpfulUpdated: async (data) => {
      setDisplayReviews((prev) =>
        prev.map((r) =>
          r.id === data.reviewId
            ? {
                ...r,
                helpfulCount: data.helpfulCount ?? r.helpfulCount,
                hasUserVoted: data.userId === currentUserId ? data.hasVoted : r.hasUserVoted,
              }
            : r
        )
      );
    },
  });

  const handleDelete = async (reviewId: number) => {
    const ok = await deleteReview(reviewId);
    if (ok) {
      await refetch();
    }
  };

  // Toggle de útil sin mostrar loader (optimista + fallback)
  const handleHelpfulToggle = async (reviewId: number) => {
    const previous = displayReviews;
    const target = previous.find((r) => r.id === reviewId);
    if (!target) return;

    const wasVoted = target.hasUserVoted;
    const delta = wasVoted ? -1 : 1;
    const nextCount = Math.max(0, (target.helpfulCount || 0) + delta);

    setDisplayReviews(
      previous.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: nextCount, hasUserVoted: !wasVoted } : r
      )
    );

    const ok = wasVoted ? await unmarkHelpful(reviewId) : await markHelpful(reviewId);
    if (!ok) {
      setDisplayReviews(previous); // revertir si falló
    }
  };

  // Visible reviews with pagination
  const visibleReviews = displayReviews.slice(0, itemsToShow);
  const hasMore = itemsToShow < displayReviews.length;

  // Reset items to show when reviews change
  useEffect(() => {
    setItemsToShow(ITEMS_PER_PAGE);
  }, [displayReviews.length, ITEMS_PER_PAGE]);

  if (isLoading && displayReviews.length === 0) {
    return (
      <SurfaceScreen>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDark ? "#fff" : "#111"} />
        </View>
      </SurfaceScreen>
    );
  }

  return (
    <SurfaceScreen
      scroll
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 140,
        gap: 24,
      }}
    >
      {/* Header */}
      <View className="gap-3">
        <BackButton onPress={onBack} />

        <View>
          <Text
            className="text-[28px] font-extrabold"
            style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
          >
            Reseñas
          </Text>
          <Text
            className="mt-2 text-xs font-semibold uppercase"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
          >
            {gymName}
          </Text>
        </View>

        <View
          className="h-px rounded-full"
          style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)' }}
        />
      </View>

      {/* Summary */}
      {displayReviews.length > 0 && (
        <View
          className="rounded-2xl px-4 py-3 flex-row items-center justify-between border"
          style={{
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
            shadowColor: isDark ? '#000000' : '#4338CA',
            shadowOpacity: isDark ? 0.35 : 0.12,
            shadowOffset: { width: 0, height: isDark ? 18 : 12 },
            shadowRadius: isDark ? 24 : 22,
            elevation: isDark ? 10 : 5,
          }}
        >
          <RatingStars rating={displayRating} size={20} />
          <Text className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {displayReviews.length} {displayReviews.length === 1 ? "reseña" : "reseñas"}
          </Text>
        </View>
      )}

      {/* Reviews Section */}
      <View className="gap-4">
        {isLoading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text
              className="text-center mt-4"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              Cargando reseñas...
            </Text>
          </View>
        ) : displayReviews.length > 0 ? (
          <>
            <ReviewsList
              reviews={visibleReviews}
              isLoading={false}
              error={null}
              pagination={undefined}
              currentUserId={currentUserId}
              onRefresh={refetch}
              onLoadMore={undefined}
              onHelpful={handleHelpfulToggle}
                            onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage="No hay reseñas aún. ¡Sé el primero en dejar una!"
            />

            {/* Ver más button */}
            {hasMore && (
              <LoadMoreButton
                onPress={() => setItemsToShow(prev => prev + ITEMS_PER_PAGE)}
                remainingItems={displayReviews.length - itemsToShow}
              />
            )}
          </>
        ) : (
          <View className="py-8 items-center justify-center">
            <Text
              className="text-center"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              No hay reseñas aún. ¡Sé el primero en dejar una!
            </Text>
          </View>
        )}
      </View>

      <CreateReviewModal
        visible={showModal}
        gymId={gymId}
        gymName={gymName}
        existingReview={reviewToEdit}
        onClose={() => {
          setShowModal(false);
          setReviewToEdit(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </SurfaceScreen>
  );
}
