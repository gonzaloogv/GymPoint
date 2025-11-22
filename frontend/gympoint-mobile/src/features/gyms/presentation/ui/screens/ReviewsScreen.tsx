import React, { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@shared/hooks";
import { SurfaceScreen } from "@shared/components/ui";
import {
  useGymReviews,
  useGymRatingStats,
  useReviewActions,
  Review,
  CreateReviewModal,
  CreateReviewData,
  UpdateReviewData,
} from "@features/reviews";
import { Ionicons } from "@expo/vector-icons";
import { ReviewsList, RatingStars } from "@features/reviews";
import { useAuthStore } from "@features/auth";

interface ReviewsScreenProps {
  gymId: number;
  gymName: string;
  onBack: () => void;
}

export function ReviewsScreen({ gymId, gymName, onBack }: ReviewsScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuthStore();

  const { reviews, pagination, isLoading, refetch, loadNextPage } = useGymReviews({
    gymId,
    limit: 10,
    sortBy: "created_at",
    order: "desc",
  });

  const { stats: ratingStats } = useGymRatingStats(gymId);
  const { createReview, updateReview, deleteReview, markHelpful, isCreating, isUpdating } = useReviewActions();

  const [showModal, setShowModal] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);

  const currentUserId = user?.id_user;

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

  const handleDelete = async (reviewId: number) => {
    const ok = await deleteReview(reviewId);
    if (ok) {
      await refetch();
    }
  };

  if (isLoading && reviews.length === 0) {
    return (
      <SurfaceScreen>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDark ? "#fff" : "#111"} />
        </View>
      </SurfaceScreen>
    );
  }

  return (
    <SurfaceScreen scroll>
      <View className={`flex-1 px-4 py-3 ${isDark ? "bg-gray-900" : "bg-white"}`}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onBack} className="pr-3">
            <Ionicons name="chevron-back" size={26} color={isDark ? "#E5E7EB" : "#111827"} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className={`text-lg font-bold ${isDark ? "text-gray-50" : "text-gray-900"}`} numberOfLines={1}>
              Reseñas · {gymName}
            </Text>
            <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Lee y escribe reseñas de otros usuarios
            </Text>
          </View>
          <TouchableOpacity onPress={handleCreate} className="pl-3 flex-row items-center">
            <Ionicons name="add-circle-outline" size={22} color={isDark ? "#60A5FA" : "#2563EB"} />
            <Text className="text-sm font-semibold" style={{ color: isDark ? "#60A5FA" : "#2563EB" }}>
              Escribir
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {ratingStats && ratingStats.totalReviews > 0 && (
          <View
            className="rounded-2xl px-4 py-3 flex-row items-center justify-between mb-4"
            style={{
              backgroundColor: isDark ? "rgba(17, 24, 39, 0.6)" : "#F9FAFB",
            }}
          >
            <RatingStars rating={ratingStats?.average || 0} size={20} />
            <Text className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? "reseña" : "reseñas"}
            </Text>
          </View>
        )}

        {/* Reviews list */}
        <ReviewsList
          reviews={reviews}
          isLoading={isLoading}
          error={null}
          pagination={pagination}
          currentUserId={currentUserId}
          onRefresh={refetch}
          onLoadMore={pagination?.hasNextPage ? loadNextPage : undefined}
          onHelpful={markHelpful}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No hay reseñas aún. ¡Sé el primero en dejar una!"
        />
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
