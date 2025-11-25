import { useMemo, useState } from 'react';
import { useReviews, useReviewStats, useApproveReview, useDeleteReview } from '../hooks';
import { Loading, ReviewStats, ReviewFilters, ReviewsGrid } from '../components';

export const Reviews = () => {
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
    error: reviewsErrorData
  } = useReviews();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorData
  } = useReviewStats();

  const approveReviewMutation = useApproveReview();
  const deleteReviewMutation = useDeleteReview();

  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const handleApiError = (err: any, context: string) => {
    const errorMessage = err.response?.data?.error?.message || 'Ocurrio un error inesperado';
    console.error(`Error en ${context}:`, err);
    alert(`Error en ${context}: ${errorMessage}`);
  };

  const handleApprove = async (id: number, isApproved: boolean) => {
    try {
      await approveReviewMutation.mutateAsync({ id_review: id, is_approved: isApproved });
      alert(`Review ${isApproved ? 'aprobada' : 'rechazada'} correctamente.`);
    } catch (err) {
      handleApiError(err, 'actualizar la review');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminar esta review permanentemente?')) {
      return;
    }

    try {
      await deleteReviewMutation.mutateAsync(id);
      alert('Review eliminada permanentemente.');
    } catch (err) {
      handleApiError(err, 'eliminar la review');
    }
  };

  const reviews = reviewsData?.reviews ?? [];
  const totalReviews = reviewsData?.total ?? 0;
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredReviews = useMemo(() => {
    if (!reviews.length) {
      return [];
    }

    return reviews.filter((review) => {
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'approved' && review.is_approved) ||
        (filterStatus === 'pending' && !review.is_approved);

      const matchesSearch =
        !normalizedSearch ||
        (review.user?.name && review.user.name.toLowerCase().includes(normalizedSearch)) ||
        (review.gym?.name && review.gym.name.toLowerCase().includes(normalizedSearch)) ||
        (review.comment && review.comment.toLowerCase().includes(normalizedSearch));

      const matchesRating = filterRating === null || review.rating === filterRating;

      return matchesStatus && matchesSearch && matchesRating;
    });
  }, [reviews, filterStatus, normalizedSearch, filterRating]);

  const approvedCount = useMemo(() => reviews.filter((r) => r.is_approved).length, [reviews]);
  const pendingCount = useMemo(() => reviews.filter((r) => !r.is_approved).length, [reviews]);

  const isLoading = reviewsLoading || statsLoading;

  if (isLoading) {
    return <Loading fullPage />;
  }

  if (reviewsError || statsError) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Error al cargar los datos de las reviews.</p>
        {reviewsError && <p className="text-sm text-text-muted">Error de Reviews: {reviewsErrorData?.message}</p>}
        {statsError && <p className="text-sm text-text-muted">Error de Estadisticas: {statsErrorData?.message}</p>}
      </div>
    );
  }

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Gestion de Reviews</h1>
          <p className="text-text-muted">{totalReviews} reviews en el sistema</p>
        </div>
      </header>

      <ReviewStats stats={stats} />

      <ReviewFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterRating={filterRating}
        setFilterRating={setFilterRating}
        totalCount={reviews.length}
        approvedCount={approvedCount}
        pendingCount={pendingCount}
      />

      <ReviewsGrid
        reviews={filteredReviews}
        onApprove={handleApprove}
        onDelete={handleDelete}
        approveReviewMutation={approveReviewMutation}
        deleteReviewMutation={deleteReviewMutation}
      />
    </div>
  );
};

