import React from 'react';
import { Card } from '../ui';
import { ReviewStats as ReviewStatsType } from '@/domain';

interface ReviewStatsProps {
  stats: ReviewStatsType | null | undefined;
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card title="📊 Estadísticas Generales">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg p-3 rounded-lg text-center">
            <p className="text-sm text-text-muted">Total</p>
            <p className="text-2xl font-bold">{stats.total_reviews}</p>
          </div>
          <div className="bg-bg p-3 rounded-lg text-center">
            <p className="text-sm text-text-muted">Promedio</p>
            <p className="text-2xl font-bold">⭐ {stats.avg_rating.toFixed(1)}</p>
          </div>
          <div className="bg-bg p-3 rounded-lg text-center">
            <p className="text-sm text-text-muted">Aprobadas</p>
            <p className="text-2xl font-bold text-success">{stats.total_approved}</p>
          </div>
          <div className="bg-bg p-3 rounded-lg text-center">
            <p className="text-sm text-text-muted">Pendientes</p>
            <p className="text-2xl font-bold text-warning">{stats.total_pending}</p>
          </div>
        </div>
      </Card>
      <Card title="📈 Distribución por Rating">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.rating_distribution[`rating_${rating}` as keyof typeof stats.rating_distribution] || 0;
            const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm font-semibold w-8">{rating}⭐</span>
                <div className="flex-1 h-4 bg-gray-200 rounded-full">
                  <div className="h-4 bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-sm font-bold w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
