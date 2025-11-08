import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

type RatingOption = {
  value: string;
  stars: number;
  label: string;
};

const RATING_OPTIONS: RatingOption[] = [
  { value: '4+ estrellas', stars: 4, label: '4+' },
  { value: '3+ estrellas', stars: 3, label: '3+' },
  { value: '2+ estrellas', stars: 2, label: '2+' },
  { value: 'Cualquiera', stars: 0, label: 'Todas' },
];

type Props = {
  title?: string;
  selectedRating: string;
  onSelectRating: (value: string) => void;
  spaced?: boolean;
};

export function StarRatingSelector({
  title,
  selectedRating,
  onSelectRating,
  spaced = false,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const primaryText = isDark ? '#F9FAFB' : '#111827';
  const secondaryText = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB';
  const backgroundColor = isDark ? '#1F2937' : '#ffffff';

  const renderStars = (count: number, isActive: boolean) => {
    if (count === 0) {
      return (
        <Ionicons
          name="star-outline"
          size={16}
          color={isActive ? '#FFFFFF' : secondaryText}
        />
      );
    }

    return (
      <View className="flex-row gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <Ionicons
            key={i}
            name="star"
            size={14}
            color={isActive ? '#FFD700' : secondaryText}
          />
        ))}
        {count < 5 && (
          <Ionicons
            name="add"
            size={14}
            color={isActive ? '#FFFFFF' : secondaryText}
          />
        )}
      </View>
    );
  };

  return (
    <>
      {title && (
        <View className={`flex-row items-center gap-2 mb-3 ${spaced ? 'mt-4' : ''}`}>
          <Ionicons name="star" size={18} color={primaryText} />
          <Text
            className="font-semibold text-base"
            style={{ color: primaryText, letterSpacing: -0.2 }}
          >
            {title}
          </Text>
        </View>
      )}
      <View className="flex-row flex-wrap gap-2">
        {RATING_OPTIONS.map((option) => {
          const active = selectedRating === option.value;

          const shadowStyle = active
            ? isDark
              ? {
                  shadowColor: '#4A9CF5',
                  shadowOpacity: 0.3,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 3,
                }
              : {
                  shadowColor: '#4A9CF5',
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 3,
                }
            : {};

          const chipStyle = StyleSheet.flatten([
            {
              minWidth: 90,
              backgroundColor: active ? '#4A9CF5' : backgroundColor,
              borderColor: active ? '#4A9CF5' : borderColor,
            },
            shadowStyle,
          ]);

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelectRating(option.value)}
              className="px-4 py-3 rounded-xl border flex-row items-center gap-2"
              style={chipStyle}
            >
              {renderStars(option.stars, active)}
              <Text
                className="font-semibold text-sm"
                style={{ color: active ? '#FFFFFF' : primaryText }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
