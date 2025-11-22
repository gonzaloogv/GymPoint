import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { GymDetailScreenProps } from "./GymDetailScreen.types";
import { useTheme, useReviewUpdates } from "@shared/hooks";
import { SurfaceScreen } from "@shared/components/ui";
import { useGymDetail } from "../../hooks/useGymDetail";
import { useGymSubscriptionStatus } from "@features/subscriptions";
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
} from "../components/gym-detail";
import {
  useGymReviews,
  useGymRatingStats,
  useReviewActions,
  CreateReviewModal,
  Review,
  CreateReviewData,
  UpdateReviewData,
} from "@features/reviews";
import { useAuthStore } from "@features/auth";
import { ReviewsScreen } from "./ReviewsScreen";
import { BackButton } from "@shared/components/ui";

export function GymDetailScreen({ gym, onBack, onCheckIn }: GymDetailScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuthStore();

  const {
    gym: gymDetail,
    schedules,
    loading,
    error,
    averageRating,
    totalReviews,
    refetch: refetchGymDetail,
  } = useGymDetail(gym.id);

  const subscriptionStatus = useGymSubscriptionStatus(
    gym.id,
    gym.name,
    gymDetail?.trial_allowed || false
  );

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [displayReviews, setDisplayReviews] = useState<Review[]>([]);

  const {
    reviews,
    pagination,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
    loadNextPage,
  } = useGymReviews({
    gymId: gym.id,
    limit: 5,
    sortBy: "created_at",
    order: "desc",
  });

  const { stats: ratingStats } = useGymRatingStats(gym.id);

  useEffect(() => {
    setDisplayReviews(reviews);
  }, [reviews]);
  const {
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    unmarkHelpful,
    isCreating,
    isUpdating,
  } = useReviewActions();

  const additionalInfo = {
    phone: gymDetail?.phone || "",
    website: gymDetail?.website || "",
    email: gymDetail?.email || "",
    amenities: gymDetail?.amenities || [],
  };

  const price = gymDetail?.monthPrice ?? gym.price ?? 0;
  const gymRules = gymDetail?.rules || [];

  const equipmentByCategory = gymDetail?.equipment || {};
  const categoryIcons: Record<string, string> = {
    fuerza: "💪",
    cardio: "🏃",
    funcional: "🤸",
    pesas: "🏋️",
    maquinas: "🛠️",
  };

  const equipment = Object.entries(equipmentByCategory).map(([category, items]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    icon: categoryIcons[category.toLowerCase()] || "💪",
    items: items || [],
  }));

  // WS: mantener GymDetail sincronizado con cambios en reviews y votos de útil
  useReviewUpdates(gym.id, {
    onNewReview: async () => {
      await refetchReviews();
    },
    onReviewUpdated: async () => {
      await refetchReviews();
    },
    onHelpfulUpdated: async (data) => {
      setDisplayReviews(prev =>
        prev.map(r =>
          r.id === data.reviewId
            ? {
                ...r,
                helpfulCount: data.helpfulCount ?? r.helpfulCount,
                hasUserVoted: data.userId === user?.id_user ? data.hasVoted : r.hasUserVoted,
              }
            : r
        )
      );
    },
  });

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
        refetchGymDetail();
        setShowReviewModal(false);
        setReviewToEdit(null);
      }
    } else {
      const result = await createReview(data as CreateReviewData);
      if (result) {
        await refetchReviews();
        refetchGymDetail();
        setShowReviewModal(false);
      }
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const success = await deleteReview(reviewId);
    if (success) {
      await refetchReviews();
      refetchGymDetail();
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    const previous = displayReviews;
    const review = previous.find((r) => r.id === reviewId);
    if (!review) return;

    const alreadyVoted = review.hasUserVoted;
    const delta = alreadyVoted ? -1 : 1;
    const nextCount = Math.max(0, (review.helpfulCount || 0) + delta);

    setDisplayReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, helpfulCount: nextCount, hasUserVoted: !alreadyVoted } : r
    ));

    const ok = alreadyVoted ? await unmarkHelpful(reviewId) : await markHelpful(reviewId);

    if (!ok) {
      setDisplayReviews(previous);
    }
  };

  const [showReviewsScreen, setShowReviewsScreen] = useState(false);

  // Mostrar solo la reseña más útil en el detalle (excluyendo la del usuario actual)
  const displayedReviews = React.useMemo(() => {
    if (!displayReviews || displayReviews.length === 0) return [];

    // Filtrar reseñas excluyendo la del usuario actual
    const otherReviews = displayReviews.filter(r => r.userId !== user?.id_user);

    if (otherReviews.length === 0) return [];

    return [...otherReviews]
      .sort((a, b) => {
        const helpfulDiff = (b.helpfulCount || 0) - (a.helpfulCount || 0);
        if (helpfulDiff !== 0) return helpfulDiff;
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 1);
  }, [displayReviews, user?.id_user]);

  const formatScheduleText = () => {
    if (!schedules || schedules.length === 0) return "Sin información de horarios";

    const normalizeDay = (value: any): number | null => {
      if (typeof value === "number") return value;
      const raw = (value || "").toString().toLowerCase().trim();
      const short = raw.substring(0, 3);
      const map: Record<string, number> = {
        dom: 0,
        sun: 0,
        lun: 1,
        mon: 1,
        mar: 2,
        tue: 2,
        mie: 3,
        mié: 3,
        wed: 3,
        jue: 4,
        thu: 4,
        vie: 5,
        fri: 5,
        sab: 6,
        sáb: 6,
        sat: 6,
      };
      return map[raw] ?? map[short] ?? null;
    };

    const nowUtc = Date.now() + new Date().getTimezoneOffset() * 60000;
    const now = new Date(nowUtc - 3 * 60 * 60000);
    const today = now.getDay();

    const todaySchedule = schedules.find((s) => normalizeDay((s as any).day_of_week) === today);
    if (!todaySchedule) return "Sin información de horarios";

    const openStr =
      (todaySchedule as any).opening_time ||
      (todaySchedule as any).open_time ||
      (todaySchedule as any).opens ||
      "";
    const closeStr =
      (todaySchedule as any).closing_time ||
      (todaySchedule as any).close_time ||
      (todaySchedule as any).closes ||
      "";

    if ((todaySchedule as any).closed === true || (todaySchedule as any).is_closed) {
      return "Cerrado ahora";
    }

    if (openStr && closeStr) {
      const [oh, om] = String(openStr).split(":").map(Number);
      const [ch, cm] = String(closeStr).split(":").map(Number);
      if ([oh, om, ch, cm].every(Number.isFinite)) {
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const openMinutes = oh * 60 + om;
        const closeMinutes = ch * 60 + cm;
        const isOpen =
          openMinutes <= closeMinutes
            ? nowMinutes >= openMinutes && nowMinutes < closeMinutes
            : nowMinutes >= openMinutes || nowMinutes < closeMinutes;
        return isOpen ? "Abierto ahora" : "Cerrado ahora";
      }
    }

    return "Sin información de horarios";
  };

  const myReview = displayReviews.find((r) => r.userId === user?.id_user);

  if (loading) {
    return (
      <SurfaceScreen>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#111827"} />
        </View>
      </SurfaceScreen>
    );
  }

  if (error) {
    return (
      <SurfaceScreen>
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-lg font-bold mb-2" style={{ color: isDark ? "#F9FAFB" : "#111827" }}>
            Error al cargar el gimnasio
          </Text>
          <Text className="text-center" style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
            {String(error)}
          </Text>
          <TouchableOpacity className="bg-primary rounded-[24px] px-6 py-3 mt-4" onPress={onBack}>
            <Text className="text-onPrimary font-semibold">Volver</Text>
          </TouchableOpacity>
        </View>
      </SurfaceScreen>
    );
  }

  if (showReviewsScreen) {
    return <ReviewsScreen gymId={gym.id} gymName={gym.name} onBack={() => setShowReviewsScreen(false)} />;
  }

  return (
    <SurfaceScreen scroll>
      <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
        <GymDetailHeader gymName={gym.name} onBack={onBack} />

        <GymRatingScheduleBar
          averageRating={averageRating ?? 0}
          totalReviews={totalReviews}
          scheduleText={formatScheduleText()}
        />

        <GymLocationCard
          address={gym.address}
          city={gym.city}
          distance={gym.distance}
          coordinates={gym.coordinates}
        />

        {gymDetail?.services && <GymServicesCard services={gymDetail.services} />}

        <GymPriceCard price={price} />

        <GymSubscriptionCard gymId={gym.id} gymName={gym.name} subscriptionStatus={subscriptionStatus} />

        {equipment.length > 0 && <GymEquipmentCard equipment={equipment} />}

        <GymScheduleCard schedules={schedules} />

        <GymContactCard phone={additionalInfo.phone} email={additionalInfo.email} website={additionalInfo.website} />

        <GymRulesCard rules={gymRules} />

        <GymMyReviewCard
          review={myReview || null}
          onHelpful={handleMarkHelpful}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
        />

        <GymReviewsSection
          reviews={displayedReviews}
          averageRating={averageRating ?? 0}
          ratingStats={ratingStats}
          isLoading={reviewsLoading}
          pagination={undefined}
          currentUserId={user?.id_user}
          hasMyReview={!!myReview}
          onCreateReview={handleCreateReview}
          onShowAll={() => setShowReviewsScreen(true)}
          onRefresh={refetchReviews}
          onLoadMore={undefined}
          onHelpful={handleMarkHelpful}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
        />

        <CheckInSection
          gymId={gym.id}
          gymName={gym.name}
          distance={gym.distance}
          subscriptionStatus={subscriptionStatus}
          onCheckIn={onCheckIn}
        />

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
