import { Review } from '@/domain';
import { Card, Button, Badge } from './index';

interface ReviewCardProps {
  review: Review;
  onApprove: (id: number, isApproved: boolean) => void;
  onDelete: (id: number) => void;
  isProcessing?: boolean;
}

export const ReviewCard = ({ review, onApprove, onDelete, isProcessing }: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Card className={`border-l-4 ${review.is_approved ? 'border-success' : 'border-warning'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col text-text dark:text-text-dark">
          <span className="font-semibold">👤 {review.user?.name || 'Usuario'}</span>
          <span className="text-sm text-text-muted">{review.user?.email || ''}</span>
        </div>
        <Badge variant={review.is_approved ? 'active' : 'pending'}>
          {review.is_approved ? 'Aprobada' : 'Pendiente'}
        </Badge>
      </div>

      <div className="bg-bg dark:bg-bg-dark p-2 rounded-lg flex items-center gap-4 mb-4 text-sm text-text dark:text-text-dark">
        <span className="font-semibold">🏋️ {review.gym?.name || 'Gimnasio'}</span>
        {review.gym?.city && <span className="text-text-muted">📍 {review.gym.city}</span>}
      </div>

      <div className="flex items-center gap-2 mb-4">
        {renderStars(review.rating)}
        <span className="text-sm font-semibold text-text-muted">({review.rating}/5)</span>
      </div>

      {review.comment && (
        <div className="bg-bg dark:bg-bg-dark p-3 rounded-lg border-l-4 border-primary italic mb-4 text-text dark:text-text-dark">
          <p>"{review.comment}"</p>
        </div>
      )}

      <div className="text-xs text-text-muted mb-4">
        <span>📅 {formatDate(review.review_date)}</span>
      </div>

      <div className="flex gap-2">
        {!review.is_approved && (
          <Button
            onClick={() => onApprove(review.id_review, true)}
            variant="success"
            size="sm"
            disabled={isProcessing}
          >
            ✅ Aprobar
          </Button>
        )}
        {review.is_approved && (
          <Button
            onClick={() => onApprove(review.id_review, false)}
            variant="danger"
            size="sm"
            disabled={isProcessing}
          >
            ❌ Rechazar
          </Button>
        )}
        <Button
          onClick={() => onDelete(review.id_review)}
          variant="danger"
          size="sm"
          disabled={isProcessing}
        >
          🗑️ Eliminar
        </Button>
      </div>
    </Card>
  );
};
