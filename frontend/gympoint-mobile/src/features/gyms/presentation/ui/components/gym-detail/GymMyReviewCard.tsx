import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { InfoCard } from '@shared/components/ui';
import { Review, ReviewCard } from '@features/reviews';

interface GymMyReviewCardProps {
  review: Review | null;
  onHelpful: (reviewId: number) => Promise<void>;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: number) => Promise<void>;
}

export function GymMyReviewCard({
  review,
  onHelpful,
  onEdit,
  onDelete,
}: GymMyReviewCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!review) {
    return null;
  }

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-3">
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(96, 165, 250, 0.14)',
            borderColor: isDark ? 'rgba(96, 165, 250, 0.38)' : 'rgba(96, 165, 250, 0.24)',
          }}
        >
          <Ionicons name="person" size={22} color={isDark ? '#93C5FD' : '#2563EB'} />
        </View>
        <Text
          className="text-lg font-bold"
          style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
        >
          Mi reseña
        </Text>
      </View>

      {/* Review Card */}
      <ReviewCard review={review} isOwnReview onHelpful={onHelpful} onEdit={onEdit} onDelete={onDelete} />
    </InfoCard>
  );
}

