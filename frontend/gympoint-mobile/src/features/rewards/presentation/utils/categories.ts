import { palette } from '@shared/styles';

type RewardCategory = 'gym' | 'lifestyle' | 'premium';

type CategoryInfo = {
  name: string;
  color: string;
};

const CATEGORY_INFO: Record<RewardCategory, CategoryInfo> = {
  gym: { name: 'Gimnasio', color: palette.gymPrimary },
  lifestyle: { name: 'Lifestyle', color: palette.lifestylePrimary },
  premium: { name: 'Premium', color: palette.premiumPrimary },
};

export const getCategoryColor = (category: RewardCategory | string) =>
  CATEGORY_INFO[category as RewardCategory]?.color ?? palette.neutralText;

export const getCategoryName = (category: RewardCategory | string) =>
  CATEGORY_INFO[category as RewardCategory]?.name ?? 'Otros';

export const formatDate = (date: Date | undefined) =>
  date
    ? date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';
