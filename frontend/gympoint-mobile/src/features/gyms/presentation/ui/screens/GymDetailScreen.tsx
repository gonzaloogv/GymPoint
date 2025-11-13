import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GymDetailScreenProps } from './GymDetailScreen.types';
import { useTheme } from '@shared/hooks';
import { SurfaceScreen } from '@shared/components/ui';
import { useGymDetail } from '../../hooks/useGymDetail';
import { useGymSubscriptionStatus } from '@features/subscriptions';
import {
  GymLocationCard,
  GymServicesCard,
  GymPriceCard,
  GymSubscriptionCard,
  GymEquipmentCard,
  GymRulesCard,
  CheckInSection,
  GymDetailHeader,
  GymRatingScheduleBar,
  GymScheduleCard,
  GymContactCard,
  GymMyReviewCard,
  GymReviewsSection,
} from '../components/gym-detail';
import {
  useGymReviews,
  useGymRatingStats,
  useReviewActions,
  CreateReviewModal,
  Review,
  CreateReviewData,
  UpdateReviewData,
} from '@features/reviews';
import { useAuthStore } from '@features/auth';

export function GymDetailScreen({ gym, onBack, onCheckIn }: GymDetailScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuthStore();

  // Fetch detailed gym data
  const { gym: gymDetail, schedules, loading, error, averageRating, totalReviews, refetch: refetchGymDetail } = useGymDetail(gym.id);

  // Subscription status
  const subscriptionStatus = useGymSubscriptionStatus(
    gym.id,
    gym.name,
    false
  );

  // Reviews state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);

  // Reviews functionality
  const {
    reviews,
    pagination,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
    loadNextPage,
  } = useGymReviews({
    gymId: gym.id,
    limit: 5,
    sortBy: 'created_at',
    order: 'DESC',
  });

  const { stats: ratingStats } = useGymRatingStats(gym.id);
  const {
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    isCreating,
    isUpdating,
  } = useReviewActions();

  // Additional info
  const additionalInfo = {
    phone: gymDetail?.phone || '',
    website: gymDetail?.website || '',
    email: gymDetail?.email || '',
    amenities: gymDetail?.amenities || [],
  };

  const price = gymDetail?.monthPrice ?? gym.price ?? 0;
  const gymRules = gymDetail?.rules || [];

  // Map equipment from API (categorized object) to array for display
  const equipmentByCategory = gymDetail?.equipment || {};
  const categoryIcons: Record<string, string> = {
    fuerza: '🏋️',
    cardio: '🏃',
    funcional: '🤸',
    pesas: '💪',
    maquinas: '⚙️',
  };

  const equipment = Object.entries(equipmentByCategory).map(([category, items]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    icon: categoryIcons[category.toLowerCase()] || '🏋️',
    items: items || [],
  }));

  // Review handlers
  const handleCreateReview = () => {
    setReviewToEdit(null);
    setShowReviewModal(true);
  };

  const handleEditReview = (review: Review) => {
    setReviewToEdit(review);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (data: CreateReviewData | UpdateReviewData) => {
    if (reviewToEdit) {
      const result = await updateReview(reviewToEdit.id, data as UpdateReviewData);
      if (result) {
        await refetchReviews();
        refetchGymDetail(); // Actualizar stats en header
        setShowReviewModal(false);
        setReviewToEdit(null);
      }
    } else {
      const result = await createReview(data as CreateReviewData);
      if (result) {
        await refetchReviews();
        refetchGymDetail(); // Actualizar stats en header
        setShowReviewModal(false);
      }
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const success = await deleteReview(reviewId);
    if (success) {
      await refetchReviews();
      refetchGymDetail(); // Actualizar stats en header
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    await markHelpful(reviewId);
    await refetchReviews();
  };

  // Format schedules for display
  const formatScheduleText = () => {
    if (!schedules || schedules.length === 0) {
      return 'Sin información de horarios';
    }

    const DAY_MAP: Record<number, string> = {
      0: 'dom',
      1: 'lun',
      2: 'mar',
      3: 'mie',
      4: 'jue',
      5: 'vie',
      6: 'sab',
    };

    const today = new Date().getDay();
    const todayKey = DAY_MAP[today];
    const todaySchedule = schedules.find((s) => s.day_of_week === todayKey);

    if (todaySchedule && !todaySchedule.closed && todaySchedule.opening_time && todaySchedule.closing_time) {
      return `${todaySchedule.opening_time.substring(0, 5)} - ${todaySchedule.closing_time.substring(0, 5)}`;
    }

    if (todaySchedule?.closed) {
      return 'Cerrado hoy';
    }

    return 'Ver horarios completos';
  };

  // Get user's review
  const myReview = reviews.find((r) => r.userId === user?.id_user);

  if (loading) {
    return (
      <SurfaceScreen>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#111827'} />
        </View>
      </SurfaceScreen>
    );
  }

  if (error) {
    return (
      <SurfaceScreen>
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-lg font-bold mb-2" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
            Error al cargar el gimnasio
          </Text>
          <Text className="text-center" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            {String(error)}
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-[24px] px-6 py-3 mt-4"
            onPress={onBack}
          >
            <Text className="text-onPrimary font-semibold">Volver</Text>
          </TouchableOpacity>
        </View>
      </SurfaceScreen>
    );
  }

  return (
    <SurfaceScreen scroll>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <GymDetailHeader gymName={gym.name} onBack={onBack} />

        {/* Rating and Schedule */}
        <GymRatingScheduleBar
          averageRating={averageRating ?? 0}
          totalReviews={totalReviews}
          scheduleText={formatScheduleText()}
        />

      {/* Location Card */}
      <GymLocationCard
        address={gym.address}
        city={gym.city}
        distance={gym.distance}
        coordinates={gym.coordinates}
      />

      {/* Services Card */}
      {gymDetail?.services && <GymServicesCard services={gymDetail.services} />}

      {/* Price Card */}
      <GymPriceCard price={price} />

      {/* Subscription Card */}
      <GymSubscriptionCard
        gymId={gym.id}
        gymName={gym.name}
        subscriptionStatus={subscriptionStatus}
      />

      {/* Equipment Card */}
      {equipment.length > 0 && <GymEquipmentCard equipment={equipment} />}

      {/* Schedule Card */}
      <GymScheduleCard schedules={schedules} />

      {/* Contact Info */}
      <GymContactCard
        phone={additionalInfo.phone}
        email={additionalInfo.email}
        website={additionalInfo.website}
      />

      {/* Rules Card */}
      <GymRulesCard rules={gymRules} />

      {/* Mi Reseña Card - Separado para mejor UX visual */}
      <GymMyReviewCard
        review={myReview || null}
        onHelpful={handleMarkHelpful}
        onEdit={handleEditReview}
        onDelete={handleDeleteReview}
      />

      {/* Reviews Section */}
      <GymReviewsSection
        reviews={reviews}
        averageRating={averageRating ?? 0}
        ratingStats={ratingStats}
        isLoading={reviewsLoading}
        pagination={pagination}
        currentUserId={user?.id_user}
        hasMyReview={!!myReview}
        onCreateReview={handleCreateReview}
        onRefresh={refetchReviews}
        onLoadMore={loadNextPage}
        onHelpful={handleMarkHelpful}
        onEdit={handleEditReview}
        onDelete={handleDeleteReview}
      />

      {/* Check-in Section */}
      <CheckInSection
        gymId={gym.id}
        gymName={gym.name}
        distance={gym.distance}
        subscriptionStatus={subscriptionStatus}
        onCheckIn={onCheckIn}
      />

      {/* Review Modal */}
      <CreateReviewModal
        visible={showReviewModal}
        gymId={gym.id}
        gymName={gym.name}
        existingReview={reviewToEdit}
        onClose={() => {
          setShowReviewModal(false);
          setReviewToEdit(null);
        }}
        onSubmit={handleSubmitReview}
        isSubmitting={isCreating || isUpdating}
      />
      </View>
    </SurfaceScreen>
  );
}
